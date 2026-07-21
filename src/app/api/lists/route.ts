import { ActivityType, PrivacyLevel } from "@prisma/client";
import { requireAuth } from "@/lib/api/auth-guard";
import { createActivity } from "@/lib/api/activity";
import { badRequest, ok, parseIntParam, parseJson, unauthorized } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";

type CreateListPayload = {
  name?: string;
  description?: string;
  visibility?: PrivacyLevel;
  tags?: string[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? undefined;
  const page = parseIntParam(searchParams.get("page"), 1, 1, 1000);
  const limit = parseIntParam(searchParams.get("limit"), 20, 1, 50);

  let where = {};
  if (username) {
    where = { user: { username }, visibility: PrivacyLevel.PUBLIC };
  }

  const lists = await prisma.list.findMany({
    where,
    include: {
      user: { select: { id: true, username: true } },
      tags: { include: { tag: true } },
      _count: { select: { movies: true } },
    },
    orderBy: { updated_at: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return ok({ lists, page, limit });
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const payload = await parseJson<CreateListPayload>(request);
  if (!payload) return badRequest("Request body must be valid JSON.");
  if (!payload.name?.trim()) return badRequest('Field "name" is required.');

  const list = await prisma.list.create({
    data: {
      list_name: payload.name,
      description: payload.description,
      visibility: payload.visibility ?? PrivacyLevel.PUBLIC,
      user_id: user.id,
    },
  });

  const tags = payload.tags?.map((name) => name.trim().toLowerCase()).filter(Boolean) ?? [];
  for (const tagName of [...new Set(tags)]) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      create: { name: tagName },
      update: {},
    });

    await prisma.listTag.create({
      data: {
        list_id: list.id,
        tag_id: tag.id,
      },
    });
  }

  await createActivity({
    actorId: user.id,
    type: ActivityType.LIST_CREATED,
    message: `${user.username ?? "A cinephile"} created a new list`,
    entityId: list.id,
    entityType: "list",
  });

  const hydrated = await prisma.list.findUnique({
    where: { id: list.id },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { movies: true } },
    },
  });

  return ok({ list: hydrated }, 201);
}
