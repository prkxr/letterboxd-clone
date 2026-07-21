import Image from "next/image";
import Link from "next/link";
import MovieSearch from "@/app/movie-search";
import { getTrendingTmdbMovies } from "@/lib/movies/tmdb";

export default async function Home() {
  const trending = await getTrendingTmdbMovies().catch(() => []);

  return (
    <main className="page">
      <div className="shell space-y-8">
        <section className="panel p-7">
          <p className="kicker">Movie Tracking Platform</p>
          <h1 className="section-title mt-3">CineJournal, a modern vintage Letterboxd-inspired platform</h1>
          <p className="section-subtitle">
            Authentication, profile pages, film logging, ratings, reviews, watchlists, custom lists, social feed,
            notifications, advanced stats, discovery filters, recommendation engine, and admin analytics.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/app" className="button primary">
              Open dashboard
            </Link>
            <Link href="/discover" className="button">
              Explore discovery
            </Link>
            <Link href="/recommendations" className="button">
              Get recommendations
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <MovieSearch />
          <aside className="panel p-5">
            <h2 className="font-display text-2xl">Trending this week</h2>
            <ul className="mt-4 space-y-3">
              {trending.slice(0, 7).map((movie) => (
                <li key={movie.tmdbId} className="flex items-center gap-3 rounded-lg border border-border p-2">
                  {movie.posterUrl ? (
                    <Image src={movie.posterUrl} alt="Poster" width={50} height={75} className="h-[75px] w-[50px] rounded object-cover" />
                  ) : (
                    <div className="h-[75px] w-[50px] rounded bg-surface-alt" />
                  )}
                  <div>
                    <Link href={`/movies/${movie.tmdbId}`} className="font-display text-lg leading-none hover:text-accent">
                      {movie.title}
                    </Link>
                    <p className="text-xs text-ink-muted">{movie.year || "Unknown"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
