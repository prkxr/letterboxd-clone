import { upsertMovieFromTmdb } from "@/lib/movies/store";
import { badRequest, ok, parseJson } from "@/lib/api/http";

type UpsertMovieRequestPayload = {
  tmdbId?: number;
};

export async function POST(request: Request) {
  const payload = await parseJson<UpsertMovieRequestPayload>(request);

  if (!payload) {
    return badRequest("Request body must be valid JSON.");
  }

  const parsedTmdbId = Number(payload.tmdbId);
  if (!Number.isInteger(parsedTmdbId) || parsedTmdbId <= 0) {
    return badRequest('Body field "tmdbId" must be a positive integer.');
  }

  try {
    const movie = await upsertMovieFromTmdb(parsedTmdbId);
    return ok({ movie });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error upserting movie.";
    return Response.json({ error: message }, { status: 502 });
  }
}
