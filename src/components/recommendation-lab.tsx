"use client";

import Image from "next/image";
import { useState } from "react";

type RecommendationItem = {
  id: string;
  score: number;
  explanation: string | null;
  movie: {
    tmdb_id: number;
    title: string;
    year: number;
    poster_url: string | null;
  };
};

type Recommendation = {
  id: string;
  reason: string | null;
  created_at: string | Date;
  items: RecommendationItem[];
};

type Props = {
  initialRecommendations: Recommendation[];
};

export default function RecommendationLab({ initialRecommendations }: Props) {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const payload = (await response.json()) as { recommendation?: Recommendation; error?: string };

    setLoading(false);

    if (!response.ok || !payload.recommendation) {
      setError(payload.error ?? "Could not generate recommendations.");
      return;
    }

    setRecommendations((previous) => [payload.recommendation as Recommendation, ...previous]);
  }

  return (
    <section className="space-y-5">
      <div className="panel p-5">
        <label className="kicker">Prompt</label>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="textarea mt-2"
          placeholder="Give me emotional slow-burn dramas with strong performances..."
        />
        <button className="button primary mt-3" onClick={generate} disabled={loading}>
          {loading ? "Generating" : "Generate recommendations"}
        </button>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </div>

      {recommendations.map((rec) => (
        <article key={rec.id} className="panel p-5">
          <p className="kicker">{new Date(rec.created_at).toLocaleString()}</p>
          <h2 className="font-display mt-2 text-2xl">Recommendation batch</h2>
          <p className="mt-1 text-sm text-ink-muted">{rec.reason ?? "Personalized from your logs and social graph."}</p>

          <div className="poster-grid mt-4">
            {rec.items.map((item) => (
              <div key={item.id} className="poster-card">
                {item.movie.poster_url ? (
                  <Image src={item.movie.poster_url} alt={item.movie.title} width={300} height={450} className="poster" />
                ) : (
                  <div className="poster" />
                )}
                <h3 className="font-display mt-2 text-lg">{item.movie.title}</h3>
                <p className="text-xs text-ink-muted">Score {item.score.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
