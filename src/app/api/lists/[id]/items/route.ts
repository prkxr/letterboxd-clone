import { ActivityType } from "@prisma/client";
import { requireAuth } from "@/lib/api/auth-guard";
import { createActivity } from "@/lib/api/activity";
import { badRequest, notFound, ok, parseJson, unauthorized } from "@/lib/api/http";
import { upsertMovieFromTmdb } from "@/lib/movies/store";
import { prisma } from "@/lib/prisma";

type AddItemPayload = {
  tmdbId?: number;
  note?: string;
};

type DeleteItemPayload = {
  movieId?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const payload = await parseJson<AddItemPayload>(request);

  if (!payload) return badRequest("Request body must be valid JSON.");

  const list = await prisma.list.findUnique({ where: { id } });
  if (!list) return notFound("List not found.");
  if (list.user_id !== user.id) return Response.json({ error: "You can only update your own lists." }, { status: 403 });

  const tmdbId = Number(payload.tmdbId);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return badRequest('Field "tmdbId" must be a positive integer.');
  }

  const movie = await upsertMovieFromTmdb(tmdbId);

  const count = await prisma.listMovie.count({ where: { list_id: list.id } });

  const item = await prisma.listMovie.upsert({
    where: { list_id_movie_id: { list_id: list.id, movie_id: movie.id } },
    create: {
      list_id: list.id,
      movie_id: movie.id,
      note: payload.note,
      position: count + 1,
    },
    update: {
      note: payload.note,
    },
    include: { movie: true },
  });

  await createActivity({
    actorId: user.id,
    type: ActivityType.LIST_UPDATED,
    message: `${user.username ?? "A cinephile"} updated a list`,
    entityId: list.id,
    entityType: "list",
  });

  return ok({ item }, 201);
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const payload = await parseJson<DeleteItemPayload>(request);
  if (!payload?.movieId) return badRequest('Field "movieId" is required.');

  const list = await prisma.list.findUnique({ where: { id } });
  if (!list) return notFound("List not found.");
  if (list.user_id !== user.id) return Response.json({ error: "You can only update your own lists." }, { status: 403 });

  await prisma.listMovie.deleteMany({
    where: {
      list_id: list.id,
      movie_id: payload.movieId,
    },
  });

  return ok({ deleted: true });
}
