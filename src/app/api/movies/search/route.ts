import { searchTmdbMovies } from '@/lib/movies/tmdb';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') ?? '';

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'Query parameter "query" is required.' },
      { status: 400 },
    );
  }

  try {
    const movies = await searchTmdbMovies(query);
    return NextResponse.json({ movies });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error searching movies.';

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
