import { requireAuth } from "@/lib/api/auth-guard";
import { badRequest, ok, parseJson, unauthorized } from "@/lib/api/http";
import { buildRecommendationsForUser } from "@/lib/recommendations/engine";
import { prisma } from "@/lib/prisma";

type RecommendationPayload = {
  prompt?: string;
};

export async function GET() {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const recommendations = await prisma.recommendation.findMany({
    where: { user_id: user.id },
    include: {
      items: {
        orderBy: { score: "desc" },
        include: { movie: true },
        take: 12,
      },
    },
    orderBy: { created_at: "desc" },
    take: 10,
  });

  return ok({ recommendations });
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const payload = await parseJson<RecommendationPayload>(request);
  if (!payload) return badRequest("Request body must be valid JSON.");

  const recommendation = await buildRecommendationsForUser(user.id, payload.prompt);
  return ok({ recommendation }, 201);
}
