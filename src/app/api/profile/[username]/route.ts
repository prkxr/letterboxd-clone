import { PrivacyLevel } from "@prisma/client";
import { notFound, ok, parseIntParam } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ username: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { username } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = parseIntParam(searchParams.get("page"), 1, 1, 1000);
  const limit = parseIntParam(searchParams.get("limit"), 12, 1, 50);

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      bio: true,
      location: true,
      website: true,
      is_private: true,
      created_at: true,
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

  if (!user) return notFound("User profile not found.");

  const [recentLogs, recentReviews, lists] = await Promise.all([
    prisma.filmLog.findMany({
      where: { user_id: user.id, visibility: PrivacyLevel.PUBLIC },
      include: { movie: true },
      orderBy: { watched_on: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.findMany({
      where: { user_id: user.id, visibility: PrivacyLevel.PUBLIC },
      include: { movie: true, _count: { select: { likes: true, comments: true } } },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
    prisma.list.findMany({
      where: { user_id: user.id, visibility: PrivacyLevel.PUBLIC },
      include: { _count: { select: { movies: true } }, tags: { include: { tag: true } } },
      orderBy: { updated_at: "desc" },
      take: 10,
    }),
  ]);

  return ok({ profile: user, recentLogs, recentReviews, lists, page, limit });
}
