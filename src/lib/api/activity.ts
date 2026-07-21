import { ActivityType, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createActivity(input: {
  actorId: string;
  type: ActivityType;
  message: string;
  entityId?: string;
  entityType?: string;
}) {
  return prisma.activity.create({
    data: {
      actor_id: input.actorId,
      type: input.type,
      message: input.message,
      entity_id: input.entityId,
      entity_type: input.entityType,
    },
  });
}

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  message: string;
  entityId?: string;
  entityType?: string;
  actorId?: string;
}) {
  return prisma.notification.create({
    data: {
      user_id: input.userId,
      type: input.type,
      message: input.message,
      entity_id: input.entityId,
      entity_type: input.entityType,
      actor_id: input.actorId,
    },
  });
}
