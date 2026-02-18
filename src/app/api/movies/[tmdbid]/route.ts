import { getTmdbMovieDetails } from "@/lib/movies/tmdb";
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ tmdbId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { tmdbId } = await context.params;
  const parsedTmdbId = Number.parseInt(tmdbId, 10);

  if (Number.isNaN(parsedTmdbId)) {
    return NextResponse.json(
      { error: 'Path parameter "tmdbId" must be a number.' },
      { status: 400 },
    );
  }

  try {
    const movie = await getTmdbMovieDetails(parsedTmdbId);
    return NextResponse.json({ movie });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error fetching movie details.';

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
