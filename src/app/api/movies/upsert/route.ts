import { prisma } from '@/lib/prisma';
import { getTmdbMovieDetails } from '@/lib/movies/tmdb';
import { NextResponse } from 'next/server';

type UpsertMovieRequestPayload = {
  tmdbId?: number;
};

export async function POST(request: Request) {
  let payload: UpsertMovieRequestPayload;

  try {
    payload = (await request.json()) as UpsertMovieRequestPayload;
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const parsedTmdbId = Number(payload.tmdbId);

  if (!Number.isInteger(parsedTmdbId) || parsedTmdbId <= 0) {
    return NextResponse.json(
      { error: 'Body field "tmdbId" must be a positive integer.' },
      { status: 400 },
    );
  }

  try {
    const movieFromTmdb = await getTmdbMovieDetails(parsedTmdbId);

    const movie = await prisma.movie.upsert({
      where: { tmdb_id: movieFromTmdb.tmdbId },
      create: {
        tmdb_id: movieFromTmdb.tmdbId,
        title: movieFromTmdb.title,
        year: movieFromTmdb.year,
        poster_url: movieFromTmdb.posterUrl,
      },
      update: {
        title: movieFromTmdb.title,
        year: movieFromTmdb.year,
        poster_url: movieFromTmdb.posterUrl,
      },
    });

    return NextResponse.json({ movie });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error upserting movie.';

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
