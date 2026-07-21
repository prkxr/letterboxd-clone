import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DiaryDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [logs, watchlist, reviews, notifications] = await Promise.all([
    prisma.filmLog.findMany({
      where: { user_id: session.user.id },
      include: { movie: true },
      orderBy: { watched_on: "desc" },
      take: 8,
    }),
    prisma.watchlistItem.findMany({
      where: { user_id: session.user.id },
      include: { movie: true },
      orderBy: [{ priority: "asc" }, { created_at: "desc" }],
      take: 6,
    }),
    prisma.review.findMany({
      where: { user_id: session.user.id },
      include: { movie: true, _count: { select: { likes: true, comments: true } } },
      orderBy: { created_at: "desc" },
      take: 4,
    }),
    prisma.notification.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
  ]);

  return (
    <main className="page">
      <div className="shell space-y-6">
        <section className="panel p-6">
          <p className="kicker">Your Dashboard</p>
          <h1 className="section-title mt-2">Welcome back, {session.user.username ?? session.user.name ?? "cinephile"}</h1>
          <p className="section-subtitle">Track what you watched, publish reviews, and stay connected with your feed.</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="panel p-5 lg:col-span-2">
            <h2 className="font-display text-2xl">Recent logs</h2>
            <ul className="mt-4 space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center gap-3 rounded-lg border border-border p-2">
                  {log.movie.poster_url ? (
                    <Image src={log.movie.poster_url} alt={log.movie.title} width={50} height={75} className="h-[75px] w-[50px] rounded object-cover" />
                  ) : (
                    <div className="h-[75px] w-[50px] rounded bg-surface-alt" />
                  )}
                  <div>
                    <Link href={`/movies/${log.movie.tmdb_id}`} className="font-display text-lg hover:text-accent">
                      {log.movie.title}
                    </Link>
                    <p className="text-xs text-ink-muted">
                      {new Date(log.watched_on).toLocaleDateString()} · {log.rating ? `${log.rating}/5` : "No rating"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel p-5">
            <h2 className="font-display text-2xl">Notifications</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {notifications.map((note) => (
                <li key={note.id} className="rounded-lg border border-border p-2">
                  {note.message}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-5">
            <h2 className="font-display text-2xl">Watchlist</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {watchlist.map((item) => (
                <li key={item.id} className="rounded-lg border border-border p-2">
                  {item.movie.title}
                </li>
              ))}
            </ul>
          </article>

          <article className="panel p-5">
            <h2 className="font-display text-2xl">Your reviews</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-lg border border-border p-2">
                  {review.movie.title} · {review._count.likes} likes · {review._count.comments} comments
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
