import { discoverTmdbMovies, getTmdbGenres, getTrendingTmdbMovies } from "@/lib/movies/tmdb";
import { badRequest, ok } from "@/lib/api/http";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "discover";

  try {
    if (mode === "trending") {
      const movies = await getTrendingTmdbMovies();
      return ok({ movies, mode });
    }

    if (mode === "genres") {
      const genres = await getTmdbGenres();
      return ok({ genres, mode });
    }

    const minYearText = searchParams.get("minYear");
    const maxYearText = searchParams.get("maxYear");
    const minVoteText = searchParams.get("minVoteAverage");

    const movies = await discoverTmdbMovies({
      query: searchParams.get("query") ?? undefined,
      includeGenres: (searchParams.get("includeGenres") ?? "").split(",").filter(Boolean),
      excludeGenres: (searchParams.get("excludeGenres") ?? "").split(",").filter(Boolean),
      minYear: minYearText ? Number.parseInt(minYearText, 10) : undefined,
      maxYear: maxYearText ? Number.parseInt(maxYearText, 10) : undefined,
      minVoteAverage: minVoteText ? Number.parseFloat(minVoteText) : undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page") ?? "1", 10) : 1,
    });

    return ok({ movies, mode: "discover" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discovery search failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Request body must be valid JSON.");
  }

  return ok({ message: "Persisted discovery filters should be created via authenticated profile routes." });
}
