import { ActivityType, NotificationType, PrivacyLevel } from "@prisma/client";
import { requireAuth } from "@/lib/api/auth-guard";
import { createActivity, createNotification } from "@/lib/api/activity";
import { badRequest, ok, parseIntParam, parseJson, unauthorized } from "@/lib/api/http";
import { upsertMovieFromTmdb } from "@/lib/movies/store";
import { prisma } from "@/lib/prisma";

type CreateReviewPayload = {
  tmdbId?: number;
  title?: string;
  body?: string;
  rating?: number;
  containsSpoiler?: boolean;
  visibility?: PrivacyLevel;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = Number(searchParams.get("tmdbId"));
  const page = parseIntParam(searchParams.get("page"), 1, 1, 1000);
  const limit = parseIntParam(searchParams.get("limit"), 20, 1, 50);

  let where = {};

  if (!Number.isNaN(tmdbId) && tmdbId > 0) {
    const movie = await prisma.movie.findUnique({ where: { tmdb_id: tmdbId }, select: { id: true } });
    where = { movie_id: movie?.id ?? "__none__" };
  }

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { id: true, username: true, image: true } },
      movie: true,
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { created_at: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return ok({ reviews, page, limit });
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const payload = await parseJson<CreateReviewPayload>(request);
  if (!payload) return badRequest("Request body must be valid JSON.");

  const tmdbId = Number(payload.tmdbId);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return badRequest('Field "tmdbId" must be a positive integer.');
  }

  if (!payload.body?.trim()) {
    return badRequest('Field "body" is required.');
  }

  if (payload.rating !== undefined && (payload.rating < 0.5 || payload.rating > 5)) {
    return badRequest('Field "rating" must be between 0.5 and 5.');
  }

  try {
    const movie = await upsertMovieFromTmdb(tmdbId);

    const review = await prisma.review.create({
      data: {
        title: payload.title,
        body: payload.body,
        rating: payload.rating,
        contains_spoiler: Boolean(payload.containsSpoiler),
        visibility: payload.visibility ?? PrivacyLevel.PUBLIC,
        user_id: user.id,
        movie_id: movie.id,
      },
      include: {
        movie: true,
        user: { select: { id: true, username: true, image: true } },
      },
    });

    await createActivity({
      actorId: user.id,
      type: ActivityType.REVIEW_CREATED,
      message: `${user.username ?? "A cinephile"} reviewed ${movie.title}`,
      entityId: review.id,
      entityType: "review",
    });

    const followers = await prisma.follow.findMany({
      where: { following_id: user.id },
      select: { follower_id: true },
      take: 1000,
    });

    for (const follower of followers) {
      await createNotification({
        userId: follower.follower_id,
        actorId: user.id,
        type: NotificationType.SYSTEM,
        message: `${user.username ?? "A user"} published a new review for ${movie.title}.`,
        entityId: review.id,
        entityType: "review",
      });
    }

    return ok({ review }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create review.";
    return Response.json({ error: message }, { status: 500 });
  }
}
