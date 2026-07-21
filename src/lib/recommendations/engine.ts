import { prisma } from "@/lib/prisma";

function normalize(map: Map<string, number>) {
  const values = [...map.values()];
  const max = Math.max(...values, 1);

  for (const [key, value] of map.entries()) {
    map.set(key, value / max);
  }

  return map;
}

export async function buildRecommendationsForUser(userId: string, prompt?: string) {
  const [highRatedLogs, follows, recentLogs] = await Promise.all([
    prisma.filmLog.findMany({
      where: { user_id: userId, rating: { gte: 4 } },
      include: { movie: { include: { movie_genres: { include: { genre: true } } } } },
      take: 100,
      orderBy: { watched_on: "desc" },
    }),
    prisma.follow.findMany({ where: { follower_id: userId }, select: { following_id: true } }),
    prisma.filmLog.findMany({ where: { user_id: userId }, select: { movie_id: true }, take: 200 }),
  ]);

  const watchedMovieIds = new Set(recentLogs.map((log) => log.movie_id));
  const genreWeights = new Map<string, number>();

  for (const log of highRatedLogs) {
    for (const movieGenre of log.movie.movie_genres) {
      const current = genreWeights.get(movieGenre.genre.name) ?? 0;
      genreWeights.set(movieGenre.genre.name, current + (log.rating ?? 3));
    }
  }

  normalize(genreWeights);

  const friendsIds = follows.map((follow) => follow.following_id);

  const friendSignals = await prisma.filmLog.findMany({
    where: {
      user_id: { in: friendsIds.length ? friendsIds : ["__none__"] },
      rating: { gte: 4 },
      movie_id: { notIn: [...watchedMovieIds] },
    },
    include: {
      movie: { include: { movie_genres: { include: { genre: true } } } },
    },
    take: 500,
    orderBy: [{ watched_on: "desc" }],
  });

  const scoreByMovie = new Map<
    string,
    { score: number; title: string; reasonParts: string[] }
  >();

  for (const signal of friendSignals) {
    const genreBoost = signal.movie.movie_genres.reduce((acc, item) => {
      return acc + (genreWeights.get(item.genre.name) ?? 0);
    }, 0);

    const baseScore = (signal.rating ?? 3) * 0.6 + genreBoost * 2;
    const existing = scoreByMovie.get(signal.movie_id);

    if (!existing) {
      scoreByMovie.set(signal.movie_id, {
        score: baseScore,
        title: signal.movie.title,
        reasonParts: ["liked by people you follow"],
      });
      continue;
    }

    existing.score += baseScore;
  }

  const ranked = [...scoreByMovie.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 20);

  const recommendation = await prisma.recommendation.create({
    data: {
      user_id: userId,
      prompt,
      reason: "Weighted blend of your top-rated genres and follow graph activity.",
    },
  });

  for (const [movieId, value] of ranked) {
    await prisma.recommendationItem.create({
      data: {
        recommendation_id: recommendation.id,
        movie_id: movieId,
        score: Number(value.score.toFixed(3)),
        explanation: value.reasonParts.join(", "),
      },
    });
  }

  return prisma.recommendation.findUnique({
    where: { id: recommendation.id },
    include: {
      items: {
        orderBy: { score: "desc" },
        include: { movie: true },
      },
    },
  });
}
