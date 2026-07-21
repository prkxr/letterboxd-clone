import { searchTmdbMovies } from "@/lib/movies/tmdb";
import { badRequest, ok } from "@/lib/api/http";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";

  if (!query.trim()) {
    return badRequest('Query parameter "query" is required.');
  }

  try {
    const movies = await searchTmdbMovies(query);
    return ok({ movies });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error searching movies.";
    return Response.json({ error: message }, { status: 502 });
  }
}
