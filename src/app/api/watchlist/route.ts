import { ActivityType } from "@prisma/client";
import { requireAuth } from "@/lib/api/auth-guard";
import { createActivity } from "@/lib/api/activity";
import { badRequest, ok, parseIntParam, parseJson, unauthorized } from "@/lib/api/http";
import { upsertMovieFromTmdb } from "@/lib/movies/store";
import { prisma } from "@/lib/prisma";

type WatchlistPayload = {
  tmdbId?: number;
  priority?: number;
  notes?: string;
};

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseIntParam(searchParams.get("page"), 1, 1, 1000);
  const limit = parseIntParam(searchParams.get("limit"), 20, 1, 100);

  const items = await prisma.watchlistItem.findMany({
    where: { user_id: user.id },
    include: { movie: true },
    orderBy: [{ priority: "asc" }, { created_at: "desc" }],
    skip: (page - 1) * limit,
    take: limit,
  });

  return ok({ items, page, limit });
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const payload = await parseJson<WatchlistPayload>(request);
  if (!payload) return badRequest("Request body must be valid JSON.");

  const tmdbId = Number(payload.tmdbId);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return badRequest('Field "tmdbId" must be a positive integer.');
  }

  try {
    const movie = await upsertMovieFromTmdb(tmdbId);

    const item = await prisma.watchlistItem.upsert({
      where: { user_id_movie_id: { user_id: user.id, movie_id: movie.id } },
      create: {
        user_id: user.id,
        movie_id: movie.id,
        priority: payload.priority,
        notes: payload.notes,
      },
      update: {
        priority: payload.priority,
        notes: payload.notes,
      },
      include: { movie: true },
    });

    await createActivity({
      actorId: user.id,
      type: ActivityType.WATCHLIST_ADDED,
      message: `${user.username ?? "A cinephile"} added ${movie.title} to watchlist`,
      entityId: item.id,
      entityType: "watchlist_item",
    });

    return ok({ item }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update watchlist.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const payload = await parseJson<WatchlistPayload>(request);
  if (!payload) return badRequest("Request body must be valid JSON.");

  const tmdbId = Number(payload.tmdbId);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return badRequest('Field "tmdbId" must be a positive integer.');
  }

  const movie = await prisma.movie.findUnique({ where: { tmdb_id: tmdbId }, select: { id: true } });
  if (!movie) return ok({ deleted: false });

  await prisma.watchlistItem.deleteMany({
    where: { user_id: user.id, movie_id: movie.id },
  });

  return ok({ deleted: true });
}
