import { getRequiredEnvironmentVariable } from "@/lib/env";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const tmdbApiKey = getRequiredEnvironmentVariable("TMDB_API_KEY");

type TmdbMoviePayload = {
  id: number;
  title: string;
  original_title: string;
  release_date: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
};

type TmdbMovieDetailPayload = TmdbMoviePayload & {
  runtime: number | null;
  tagline: string;
  genres: Array<{ id: number; name: string }>;
};

export type NormalizedMovie = {
  tmdbId: number;
  title: string;
  originalTitle: string;
  year: number;
  releaseDate: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  languageCode: string;
};

export type NormalizedMovieDetails = NormalizedMovie & {
  runtime: number | null;
  tagline: string;
  genres: Array<{ tmdbId: number; name: string }>;
};

type DiscoverOptions = {
  query?: string;
  includeGenres?: string[];
  excludeGenres?: string[];
  minYear?: number;
  maxYear?: number;
  minVoteAverage?: number;
  sortBy?: string;
  page?: number;
};

function getYearFromReleaseDate(releaseDate: string | null) {
  if (!releaseDate) return 0;

  const [yearText] = releaseDate.split("-");
  const year = Number.parseInt(yearText, 10);
  return Number.isNaN(year) ? 0 : year;
}

function buildImageUrl(path: string | null, size: "w500" | "w780" = "w500") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

function normalizeMovie(payload: TmdbMoviePayload): NormalizedMovie {
  return {
    tmdbId: payload.id,
    title: payload.title,
    originalTitle: payload.original_title,
    year: getYearFromReleaseDate(payload.release_date),
    releaseDate: payload.release_date,
    posterUrl: buildImageUrl(payload.poster_path, "w500"),
    backdropUrl: buildImageUrl(payload.backdrop_path, "w780"),
    overview: payload.overview,
    voteAverage: payload.vote_average,
    voteCount: payload.vote_count,
    popularity: payload.popularity,
    languageCode: payload.original_language,
  };
}

function normalizeMovieDetails(payload: TmdbMovieDetailPayload): NormalizedMovieDetails {
  return {
    ...normalizeMovie(payload),
    runtime: payload.runtime,
    tagline: payload.tagline,
    genres: payload.genres.map((genre) => ({ tmdbId: genre.id, name: genre.name })),
  };
}

async function requestTmdb<T>(path: string, searchParams: URLSearchParams) {
  searchParams.set("api_key", tmdbApiKey);

  const url = `${TMDB_API_BASE_URL}${path}?${searchParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
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
  if (!trimmedQuery) return [];

  const searchParams = new URLSearchParams({
    query: trimmedQuery,
    include_adult: "false",
    language: "en-US",
    page: "1",
  });

  const payload = await requestTmdb<{ results: TmdbMoviePayload[] }>("/search/movie", searchParams);
  return payload.results.map(normalizeMovie);
}

export async function discoverTmdbMovies(options: DiscoverOptions) {
  const searchParams = new URLSearchParams({
    include_adult: "false",
    include_video: "false",
    language: "en-US",
    page: String(options.page ?? 1),
    sort_by: options.sortBy ?? "popularity.desc",
  });

  if (options.query?.trim()) {
    return searchTmdbMovies(options.query);
  }

  if (options.includeGenres?.length) {
    searchParams.set("with_genres", options.includeGenres.join(","));
  }

  if (options.excludeGenres?.length) {
    searchParams.set("without_genres", options.excludeGenres.join(","));
  }

  if (options.minYear) {
    searchParams.set("primary_release_date.gte", `${options.minYear}-01-01`);
  }

  if (options.maxYear) {
    searchParams.set("primary_release_date.lte", `${options.maxYear}-12-31`);
  }

  if (options.minVoteAverage) {
    searchParams.set("vote_average.gte", String(options.minVoteAverage));
    searchParams.set("vote_count.gte", "50");
  }

  const payload = await requestTmdb<{ results: TmdbMoviePayload[] }>("/discover/movie", searchParams);
  return payload.results.map(normalizeMovie);
}

export async function getTrendingTmdbMovies() {
  const payload = await requestTmdb<{ results: TmdbMoviePayload[] }>(
    "/trending/movie/week",
    new URLSearchParams({ language: "en-US" }),
  );

  return payload.results.map(normalizeMovie);
}

export async function getTmdbMovieDetails(tmdbId: number) {
  const payload = await requestTmdb<TmdbMovieDetailPayload>(
    `/movie/${tmdbId}`,
    new URLSearchParams({ language: "en-US" }),
  );

  return normalizeMovieDetails(payload);
}

export async function getTmdbGenres() {
  const payload = await requestTmdb<{ genres: Array<{ id: number; name: string }> }>(
    "/genre/movie/list",
    new URLSearchParams({ language: "en-US" }),
  );

  return payload.genres;
}
