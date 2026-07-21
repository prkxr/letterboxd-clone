import { ActivityType, PrivacyLevel } from "@prisma/client";
import { requireAuth } from "@/lib/api/auth-guard";
import { createActivity } from "@/lib/api/activity";
import { badRequest, ok, parseIntParam, parseJson, unauthorized } from "@/lib/api/http";
import { upsertMovieFromTmdb } from "@/lib/movies/store";
import { prisma } from "@/lib/prisma";

type CreateLogPayload = {
  tmdbId?: number;
  watchedOn?: string;
  rewatch?: boolean;
  containsSpoiler?: boolean;
  rating?: number;
  reviewExcerpt?: string;
  visibility?: PrivacyLevel;
  tags?: string[];
};

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseIntParam(searchParams.get("page"), 1, 1, 1000);
  const limit = parseIntParam(searchParams.get("limit"), 20, 1, 50);

  const logs = await prisma.filmLog.findMany({
    where: { user_id: user.id },
    include: {
      movie: true,
      tags: { include: { tag: true } },
    },
    orderBy: { watched_on: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return ok({ logs, page, limit });
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const payload = await parseJson<CreateLogPayload>(request);
  if (!payload) return badRequest("Request body must be valid JSON.");

  const tmdbId = Number(payload.tmdbId);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return badRequest('Field "tmdbId" must be a positive integer.');
  }

  if (payload.rating !== undefined && (payload.rating < 0.5 || payload.rating > 5)) {
    return badRequest('Field "rating" must be between 0.5 and 5.');
  }

  const watchedOn = payload.watchedOn ? new Date(payload.watchedOn) : new Date();
  if (Number.isNaN(watchedOn.getTime())) {
    return badRequest('Field "watchedOn" must be a valid date.');
  }

  try {
    const movie = await upsertMovieFromTmdb(tmdbId);

    const log = await prisma.filmLog.create({
      data: {
        watched_on: watchedOn,
        rewatch: Boolean(payload.rewatch),
        contains_spoiler: Boolean(payload.containsSpoiler),
        rating: payload.rating,
        review_excerpt: payload.reviewExcerpt,
        visibility: payload.visibility ?? PrivacyLevel.PUBLIC,
        user_id: user.id,
        movie_id: movie.id,
      },
    });

    const tags = payload.tags?.map((name) => name.trim().toLowerCase()).filter(Boolean) ?? [];

    for (const tagName of [...new Set(tags)]) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        create: { name: tagName },
        update: {},
      });

      await prisma.filmLogTag.create({
        data: {
          log_id: log.id,
          tag_id: tag.id,
        },
      });
    }

    await createActivity({
      actorId: user.id,
      type: ActivityType.LOG_CREATED,
      message: `${user.username ?? "A cinephile"} logged ${movie.title}`,
      entityId: log.id,
      entityType: "film_log",
    });

    const hydrated = await prisma.filmLog.findUnique({
      where: { id: log.id },
      include: { movie: true, tags: { include: { tag: true } } },
    });

    return ok({ log: hydrated }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create log entry.";
    return Response.json({ error: message }, { status: 500 });
  }
}
