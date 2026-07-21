import { requireAuth } from "@/lib/api/auth-guard";
import { badRequest, ok, parseIntParam, parseJson, unauthorized } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";

type MarkReadPayload = {
  ids?: string[];
  markAll?: boolean;
};

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseIntParam(searchParams.get("page"), 1, 1, 1000);
  const limit = parseIntParam(searchParams.get("limit"), 20, 1, 100);

  const notifications = await prisma.notification.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: { user_id: user.id, read_at: null },
  });

  return ok({ notifications, unreadCount, page, limit });
}

export async function PATCH(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const payload = await parseJson<MarkReadPayload>(request);
  if (!payload) return badRequest("Request body must be valid JSON.");

  if (!payload.markAll && (!payload.ids || payload.ids.length === 0)) {
    return badRequest('Provide "markAll: true" or an array in "ids".');
  }

  if (payload.markAll) {
    await prisma.notification.updateMany({
      where: { user_id: user.id, read_at: null },
      data: { read_at: new Date() },
    });

    return ok({ updated: "all" });
  }

  await prisma.notification.updateMany({
    where: {
      id: { in: payload.ids },
      user_id: user.id,
    },
    data: { read_at: new Date() },
  });

  return ok({ updated: payload.ids?.length ?? 0 });
}
