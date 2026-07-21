import { prisma } from "@/lib/prisma";
import { getTmdbMovieDetails } from "@/lib/movies/tmdb";

export async function upsertMovieFromTmdb(tmdbId: number) {
  const details = await getTmdbMovieDetails(tmdbId);

  return prisma.$transaction(async (tx) => {
    const movie = await tx.movie.upsert({
      where: { tmdb_id: details.tmdbId },
      create: {
        tmdb_id: details.tmdbId,
        title: details.title,
        original_title: details.originalTitle,
        year: details.year,
        release_date: details.releaseDate ? new Date(details.releaseDate) : null,
        runtime_minutes: details.runtime,
        poster_url: details.posterUrl,
        backdrop_url: details.backdropUrl,
        overview: details.overview,
        tagline: details.tagline,
        language_code: details.languageCode,
        vote_average: details.voteAverage,
        vote_count: details.voteCount,
        popularity: details.popularity,
      },
      update: {
        title: details.title,
        original_title: details.originalTitle,
        year: details.year,
        release_date: details.releaseDate ? new Date(details.releaseDate) : null,
        runtime_minutes: details.runtime,
        poster_url: details.posterUrl,
        backdrop_url: details.backdropUrl,
        overview: details.overview,
        tagline: details.tagline,
        language_code: details.languageCode,
        vote_average: details.voteAverage,
        vote_count: details.voteCount,
        popularity: details.popularity,
      },
    });

    await tx.movieGenre.deleteMany({ where: { movie_id: movie.id } });

    for (const genre of details.genres) {
      const createdGenre = await tx.genre.upsert({
        where: { tmdb_id: genre.tmdbId },
        create: { tmdb_id: genre.tmdbId, name: genre.name },
        update: { name: genre.name },
      });

      await tx.movieGenre.create({
        data: {
          movie_id: movie.id,
          genre_id: createdGenre.id,
        },
      });
    }

    return movie;
  });
}
