import { ActivityType, NotificationType } from "@prisma/client";
import { requireAuth } from "@/lib/api/auth-guard";
import { createActivity, createNotification } from "@/lib/api/activity";
import { badRequest, notFound, ok, parseJson, unauthorized } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";

type FollowPayload = {
  username?: string;
};

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const payload = await parseJson<FollowPayload>(request);
  if (!payload?.username?.trim()) {
    return badRequest('Field "username" is required.');
  }

  const target = await prisma.user.findUnique({
    where: { username: payload.username },
    select: { id: true, username: true },
  });

  if (!target) return notFound("User not found.");
  if (target.id === user.id) return badRequest("You cannot follow yourself.");

  await prisma.follow.upsert({
    where: {
      follower_id_following_id: {
        follower_id: user.id,
        following_id: target.id,
      },
    },
    create: {
      follower_id: user.id,
      following_id: target.id,
    },
    update: {},
  });

  await createActivity({
    actorId: user.id,
    type: ActivityType.USER_FOLLOWED,
    message: `${user.username ?? "A cinephile"} followed ${target.username ?? "a user"}`,
    entityId: target.id,
    entityType: "user",
  });

  await createNotification({
    userId: target.id,
    actorId: user.id,
    type: NotificationType.NEW_FOLLOWER,
    message: `${user.username ?? "Someone"} followed you.`,
    entityId: user.id,
    entityType: "user",
  });

  return ok({ followed: true });
}

export async function DELETE(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const payload = await parseJson<FollowPayload>(request);
  if (!payload?.username?.trim()) {
    return badRequest('Field "username" is required.');
  }

  const target = await prisma.user.findUnique({
    where: { username: payload.username },
    select: { id: true },
  });

  if (!target) return notFound("User not found.");

  await prisma.follow.deleteMany({
    where: {
      follower_id: user.id,
      following_id: target.id,
    },
  });

  return ok({ followed: false });
}
