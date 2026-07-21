import DiscoverExplorer from "@/components/discover-explorer";
import { getTmdbGenres, getTrendingTmdbMovies } from "@/lib/movies/tmdb";

export default async function DiscoverPage() {
  const [movies, genres] = await Promise.all([
    getTrendingTmdbMovies().catch(() => []),
    getTmdbGenres().catch(() => []),
  ]);

  return (
    <main className="page">
      <div className="shell space-y-6">
        <section className="panel p-6">
          <p className="kicker">Search and Discovery</p>
          <h1 className="section-title mt-2">Advanced filters for mood, year, genre, and quality</h1>
          <p className="section-subtitle">
            Blend keyword search with curated filters to discover films faster and save your taste profile.
          </p>
        </section>

        <DiscoverExplorer initialMovies={movies} genres={genres} />
      </div>
    </main>
  );
}
