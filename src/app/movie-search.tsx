"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

type SearchMovie = {
  tmdbId: number;
  title: string;
  year: number;
  posterUrl: string | null;
  overview: string;
  voteAverage: number;
};

type SearchState = {
  isLoading: boolean;
  error: string | null;
  movies: SearchMovie[];
  query: string;
};

export default function MovieSearch() {
  const [state, setState] = useState<SearchState>({
    isLoading: false,
    error: null,
    movies: [],
    query: "",
  });

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("query") ?? "");

    if (!query.trim()) {
      setState((previousState) => ({
        ...previousState,
        query,
        movies: [],
        error: "Enter a movie title to search.",
      }));
      return;
    }

    setState((previousState) => ({
      ...previousState,
      query,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`);
      const payload = (await response.json()) as { movies?: SearchMovie[]; error?: string };

      if (!response.ok) {
        setState((previousState) => ({
          ...previousState,
          isLoading: false,
          movies: [],
          error: payload.error ?? "Movie search failed.",
        }));
        return;
      }

      setState((previousState) => ({
        ...previousState,
        isLoading: false,
        movies: payload.movies ?? [],
        error: null,
      }));
    } catch {
      setState((previousState) => ({
        ...previousState,
        isLoading: false,
        movies: [],
        error: "Could not reach movie search service.",
      }));
    }
  }

  return (
    <section className="panel p-5 lg:col-span-2">
      <h2 className="section-title" style={{ fontSize: "2rem" }}>
        Find any film
      </h2>
      <p className="section-subtitle">Search TMDB and open each title for details and logging actions.</p>

      <form className="mt-4 flex gap-3" onSubmit={handleSearch}>
        <input className="input" defaultValue={state.query} name="query" placeholder="The Conversation, 1974..." />
        <button type="submit" className="button primary" disabled={state.isLoading}>
          {state.isLoading ? "Searching" : "Search"}
        </button>
      </form>

      {state.error ? <p className="mt-3 text-sm text-red-400">{state.error}</p> : null}

      {state.movies.length > 0 ? (
        <ul className="poster-grid mt-5">
          {state.movies.map((movie) => (
            <li key={movie.tmdbId} className="poster-card">
              <Link href={`/movies/${movie.tmdbId}`}>
                {movie.posterUrl ? (
                  <Image src={movie.posterUrl} alt={`${movie.title} poster`} width={300} height={450} className="poster" />
                ) : (
                  <div className="poster" />
                )}
                <h3 className="font-display mt-3 text-lg leading-tight">{movie.title}</h3>
                <p className="text-xs text-ink-muted">{movie.year || "Unknown year"}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
