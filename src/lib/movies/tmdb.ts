import { getRequiredEnvironmentVariable } from '@/lib/env';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApiKey = getRequiredEnvironmentVariable('TMDB_API_KEY');

type TmdbMoviePayload = {
  id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
  overview: string;
  vote_average: number;
};

type TmdbMovieDetailPayload = TmdbMoviePayload & {
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
};

export type NormalizedMovie = {
  tmdbId: number;
  title: string;
  year: number;
  posterUrl: string | null;
  overview: string;
  voteAverage: number;
};

export type NormalizedMovieDetails = NormalizedMovie & {
  runtime: number | null;
  genres: string[];
};

function getYearFromReleaseDate(releaseDate: string | null) {
  if (!releaseDate) {
    return 0;
  }

  const [yearText] = releaseDate.split('-');
  const year = Number.parseInt(yearText, 10);

  return Number.isNaN(year) ? 0 : year;
}

function buildPosterUrl(posterPath: string | null) {
  if (!posterPath) {
    return null;
  }

  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

function normalizeMovie(payload: TmdbMoviePayload): NormalizedMovie {
  return {
    tmdbId: payload.id,
    title: payload.title,
    year: getYearFromReleaseDate(payload.release_date),
    posterUrl: buildPosterUrl(payload.poster_path),
    overview: payload.overview,
    voteAverage: payload.vote_average,
  };
}

function normalizeMovieDetails(payload: TmdbMovieDetailPayload): NormalizedMovieDetails {
  return {
    ...normalizeMovie(payload),
    runtime: payload.runtime,
    genres: payload.genres.map((genre) => genre.name),
  };
}

async function requestTmdb<T>(path: string, searchParams: URLSearchParams) {
  searchParams.set('api_key', tmdbApiKey);

  const url = `${TMDB_API_BASE_URL}${path}?${searchParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(
      `TMDB request failed (${response.status} ${response.statusText}) for ${path}. Response: ${errorPayload}`,
    );
  }

  return (await response.json()) as T;
}

export async function searchTmdbMovies(query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const searchParams = new URLSearchParams({
    query: trimmedQuery,
    include_adult: 'false',
    language: 'en-US',
    page: '1',
  });

  const payload = await requestTmdb<{ results: TmdbMoviePayload[] }>('/search/movie', searchParams);

  return payload.results.map(normalizeMovie);
}

export async function getTmdbMovieDetails(tmdbId: number) {
  const searchParams = new URLSearchParams({ language: 'en-US' });
  const payload = await requestTmdb<TmdbMovieDetailPayload>(`/movie/${tmdbId}`, searchParams);

  return normalizeMovieDetails(payload);
}
