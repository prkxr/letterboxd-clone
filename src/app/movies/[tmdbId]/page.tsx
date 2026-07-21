import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MovieActions from "@/components/movie-actions";
import { getTmdbMovieDetails } from "@/lib/movies/tmdb";

type Props = {
  params: Promise<{ tmdbId: string }>;
};

export default async function MovieDetailsPage({ params }: Props) {
  const { tmdbId } = await params;
  const parsedTmdbId = Number.parseInt(tmdbId, 10);

  if (Number.isNaN(parsedTmdbId) || parsedTmdbId <= 0) {
    notFound();
  }

  const movie = await getTmdbMovieDetails(parsedTmdbId).catch(() => null);
  if (!movie) notFound();

  return (
    <main className="page">
      <div className="shell panel grid gap-8 p-6 md:grid-cols-[300px_1fr]">
        <div>
          {movie.posterUrl ? (
            <Image src={movie.posterUrl} alt={`${movie.title} poster`} width={500} height={750} className="poster" />
          ) : (
            <div className="poster" />
          )}
        </div>

        <section>
          <p className="kicker">Film page</p>
          <h1 className="section-title mt-2">{movie.title}</h1>
          <p className="mt-2 text-ink-muted">
            {movie.year || "Unknown year"} · {movie.runtime ? `${movie.runtime} min` : "Unknown runtime"} ·{" "}
            {Array.isArray(movie.genres) ? movie.genres.map((g) => "name" in g ? g.name : g).join(", ") : movie.genres || "No genres"}
          </p>
          <p className="mt-4 text-sm text-ink-muted">TMDB score: {movie.voteAverage.toFixed(1)}</p>
          <p className="mt-5 max-w-3xl leading-relaxed text-ink-muted">{movie.overview || "No overview available."}</p>

          <MovieActions movie={{ tmdbId: movie.tmdbId, title: movie.title, year: movie.year, posterUrl: movie.posterUrl }} />

          <Link href="/" className="mt-6 inline-block text-sm text-accent hover:underline">
            Back to home
          </Link>
        </section>
      </div>
    </main>
  );
}
