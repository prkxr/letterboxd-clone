import { getTmdbMovieDetails } from "@/lib/movies/tmdb";
import { badRequest, ok } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{ tmdbid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { tmdbid } = await context.params;
  const parsedTmdbId = Number.parseInt(tmdbid, 10);

  if (Number.isNaN(parsedTmdbId) || parsedTmdbId <= 0) {
    return badRequest('Path parameter "tmdbid" must be a positive number.');
  }

  try {
    const movie = await getTmdbMovieDetails(parsedTmdbId);
    return ok({ movie });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error fetching movie details.";

    if (message.includes("(404")) {
      return Response.json({ error: `Movie with tmdbId ${parsedTmdbId} was not found.` }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 502 });
  }
}
