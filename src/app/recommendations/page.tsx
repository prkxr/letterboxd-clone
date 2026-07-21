import { redirect } from "next/navigation";
import RecommendationLab from "@/components/recommendation-lab";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RecommendationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const recommendations = await prisma.recommendation.findMany({
    where: { user_id: session.user.id },
    include: {
      items: {
        orderBy: { score: "desc" },
        include: { movie: true },
        take: 18,
      },
    },
    orderBy: { created_at: "desc" },
    take: 5,
  });

  return (
    <main className="page">
      <div className="shell space-y-6">
        <section className="panel p-6">
          <p className="kicker">Recommendation Engine</p>
          <h1 className="section-title mt-2">Personalized picks from ratings, logs, and social signals</h1>
          <p className="section-subtitle">
            The engine weighs your favorite genres, highly-rated logs, and what trusted accounts watch.
          </p>
        </section>

        <RecommendationLab initialRecommendations={recommendations} />
      </div>
    </main>
  );
}
