import { isAdmin, requireAuth } from "@/lib/api/auth-guard";
import { forbidden, ok, unauthorized } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireAuth();
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden();

  const [
    userCount,
    movieCount,
    reviewCount,
    logsCount,
    watchlistCount,
    listCount,
    notificationCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.movie.count(),
    prisma.review.count(),
    prisma.filmLog.count(),
    prisma.watchlistItem.count(),
    prisma.list.count(),
    prisma.notification.count(),
  ]);

  const latestUsers = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    select: { id: true, username: true, email: true, role: true, created_at: true },
    take: 10,
  });

  return ok({
    metrics: {
      users: userCount,
      movies: movieCount,
      reviews: reviewCount,
      logs: logsCount,
      watchlistItems: watchlistCount,
      lists: listCount,
      notifications: notificationCount,
    },
    latestUsers,
  });
}
