import { requireAuth } from "@/lib/api/auth-guard";
import { ok, parseIntParam, unauthorized } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseIntParam(searchParams.get("page"), 1, 1, 1000);
  const limit = parseIntParam(searchParams.get("limit"), 30, 1, 100);

  const following = await prisma.follow.findMany({
    where: { follower_id: user.id },
    select: { following_id: true },
  });

  const actorIds = [user.id, ...following.map((entry) => entry.following_id)];

  const activities = await prisma.activity.findMany({
    where: { actor_id: { in: actorIds } },
    include: {
      actor: { select: { id: true, username: true, image: true } },
    },
    orderBy: { created_at: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return ok({ activities, page, limit });
}
