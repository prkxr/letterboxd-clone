import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const profile = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          logs: true,
          reviews: true,
          lists: true,
          watchlist_items: true,
        },
      },
    },
  });

  if (!profile) notFound();

  const [logs, lists] = await Promise.all([
    prisma.filmLog.findMany({
      where: { user_id: profile.id },
      include: { movie: true },
      orderBy: { watched_on: "desc" },
      take: 9,
    }),
    prisma.list.findMany({
      where: { user_id: profile.id },
      include: { _count: { select: { movies: true } } },
      orderBy: { updated_at: "desc" },
      take: 8,
    }),
  ]);

  return (
    <main className="page">
      <div className="shell space-y-6">
        <section className="panel p-6">
          <p className="kicker">Profile</p>
          <h1 className="section-title mt-2">@{profile.username ?? "cinephile"}</h1>
          {profile.bio ? <p className="section-subtitle">{profile.bio}</p> : null}

          <div className="stats-grid mt-4">
            <div className="stat">
              <p className="kicker">Followers</p>
              <p className="font-display text-2xl">{profile._count.followers}</p>
            </div>
            <div className="stat">
              <p className="kicker">Following</p>
              <p className="font-display text-2xl">{profile._count.following}</p>
            </div>
            <div className="stat">
              <p className="kicker">Logs</p>
              <p className="font-display text-2xl">{profile._count.logs}</p>
            </div>
            <div className="stat">
              <p className="kicker">Reviews</p>
              <p className="font-display text-2xl">{profile._count.reviews}</p>
            </div>
            <div className="stat">
              <p className="kicker">Watchlist</p>
              <p className="font-display text-2xl">{profile._count.watchlist_items}</p>
            </div>
            <div className="stat">
              <p className="kicker">Lists</p>
              <p className="font-display text-2xl">{profile._count.lists}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-5">
            <h2 className="font-display text-2xl">Latest logs</h2>
            <div className="poster-grid mt-4">
              {logs.map((log) => (
                <Link key={log.id} href={`/movies/${log.movie.tmdb_id}`} className="poster-card">
                  {log.movie.poster_url ? (
                    <Image src={log.movie.poster_url} alt={log.movie.title} width={300} height={450} className="poster" />
                  ) : (
                    <div className="poster" />
                  )}
                  <h3 className="font-display mt-2 text-lg">{log.movie.title}</h3>
                </Link>
              ))}
            </div>
          </article>

          <article className="panel p-5">
            <h2 className="font-display text-2xl">Custom lists</h2>
            <ul className="mt-4 space-y-3">
              {lists.map((list) => (
                <li key={list.id} className="rounded-lg border border-border p-3">
                  <p className="font-display text-xl">{list.list_name}</p>
                  <p className="text-sm text-ink-muted">{list._count.movies} films</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
