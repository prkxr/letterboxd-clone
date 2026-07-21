import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MODERATOR) {
    redirect("/");
  }

  const [users, movies, logs, reviews, notifications] = await Promise.all([
    prisma.user.count(),
    prisma.movie.count(),
    prisma.filmLog.count(),
    prisma.review.count(),
    prisma.notification.count(),
  ]);

  return (
    <main className="page">
      <div className="shell space-y-6">
        <section className="panel p-6">
          <p className="kicker">Admin Panel</p>
          <h1 className="section-title mt-2">Platform operations and moderation metrics</h1>
        </section>

        <section className="stats-grid">
          <article className="stat">
            <p className="kicker">Users</p>
            <p className="font-display text-3xl">{users}</p>
          </article>
          <article className="stat">
            <p className="kicker">Movies</p>
            <p className="font-display text-3xl">{movies}</p>
          </article>
          <article className="stat">
            <p className="kicker">Logs</p>
            <p className="font-display text-3xl">{logs}</p>
          </article>
          <article className="stat">
            <p className="kicker">Reviews</p>
            <p className="font-display text-3xl">{reviews}</p>
          </article>
          <article className="stat">
            <p className="kicker">Notifications</p>
            <p className="font-display text-3xl">{notifications}</p>
          </article>
        </section>
      </div>
    </main>
  );
}
