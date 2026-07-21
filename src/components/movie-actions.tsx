"use client";

import { useState } from "react";
import LogMovieModal from "./log-movie-modal";

type Movie = {
  tmdbId: number;
  title: string;
  year: number;
  posterUrl: string | null;
};

type Props = {
  movie: Movie;
};

export default function MovieActions({ movie }: Props) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function addToWatchlist() {
    setIsBusy(true);
    setMessage(null);
    const response = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdbId: movie.tmdbId }),
    });
    setIsBusy(false);
    setMessage(response.ok 
      ? { type: "success", text: "Added to watchlist." } 
      : { type: "error", text: "Sign in required or request failed." }
    );
  }

  function handleLogged() {
    setMessage({ type: "success", text: "Movie logged successfully!" });
    setIsLogModalOpen(false);
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <button 
          className="button primary" 
          onClick={() => setIsLogModalOpen(true)}
        >
          Log Movie
        </button>
        <button 
          className="button" 
          onClick={addToWatchlist} 
          disabled={isBusy}
        >
          Add to watchlist
        </button>
        {message ? (
          <p className={`w-full text-sm ${message.type === "error" ? "text-red-400" : "text-green-400"}`}>
            {message.text}
          </p>
        ) : null}
      </div>

      <LogMovieModal
        movie={movie}
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onLogged={handleLogged}
      />
    </>
  );
}
