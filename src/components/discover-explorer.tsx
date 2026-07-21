"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

type Movie = {
  tmdbId: number;
  title: string;
  year: number;
  posterUrl: string | null;
  voteAverage: number;
};

type Genre = { id: number; name: string };

type Props = {
  initialMovies: Movie[];
  genres: Genre[];
};

export default function DiscoverExplorer({ initialMovies, genres }: Props) {
  const [movies, setMovies] = useState(initialMovies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("query") ?? "").trim();
    const includeGenres = formData.getAll("genres").map(String).join(",");
    const minYear = String(formData.get("minYear") ?? "").trim();

    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (includeGenres) params.set("includeGenres", includeGenres);
    if (minYear) params.set("minYear", minYear);

    const response = await fetch(`/api/discovery/search?${params.toString()}`);
    const payload = (await response.json()) as { movies?: Movie[]; error?: string };

    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Could not run discovery search.");
      return;
    }

    setMovies(payload.movies ?? []);
  }

  return (
    <section className="space-y-5">
      <form onSubmit={onSubmit} className="panel grid gap-3 p-5 md:grid-cols-[2fr_2fr_1fr_auto] md:items-end">
        <div>
          <label className="kicker">Query</label>
          <input name="query" className="input mt-1" placeholder="directors, mood, title..." />
        </div>

        <div>
          <label className="kicker">Genres</label>
          <select className="select mt-1" name="genres" multiple size={1}>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="kicker">From year</label>
          <input className="input mt-1" name="minYear" placeholder="1990" />
        </div>

        <button className="button primary h-[42px]" disabled={loading}>
          {loading ? "Filtering" : "Apply"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="poster-grid">
        {movies.map((movie) => (
          <article key={movie.tmdbId} className="poster-card">
            <Link href={`/movies/${movie.tmdbId}`}>
              {movie.posterUrl ? (
                <Image src={movie.posterUrl} alt={movie.title} width={300} height={450} className="poster" />
              ) : (
                <div className="poster" />
              )}
              <h3 className="font-display mt-2 text-lg leading-tight">{movie.title}</h3>
              <p className="text-xs text-ink-muted">
                {movie.year || "Unknown"} · {movie.voteAverage.toFixed(1)}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
