"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { PrivacyLevel } from "@prisma/client";
import RatingInput from "./rating-input";

type Movie = {
  tmdbId: number;
  title: string;
  year: number;
  posterUrl: string | null;
};

type LogMovieModalProps = {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onLogged?: () => void;
};

type FormData = {
  rating: number;
  watchedOn: string;
  rewatch: boolean;
  containsSpoiler: boolean;
  tags: string;
  reviewExcerpt: string;
  visibility: PrivacyLevel;
};

const initialFormData: FormData = {
  rating: 0,
  watchedOn: new Date().toISOString().split("T")[0],
  rewatch: false,
  containsSpoiler: false,
  tags: "",
  reviewExcerpt: "",
  visibility: PrivacyLevel.PUBLIC,
};

export default function LogMovieModal({ movie, isOpen, onClose, onLogged }: LogMovieModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleRatingChange(rating: number) {
    setFormData((prev) => ({ ...prev, rating }));
  }

  function handleChange(field: keyof FormData, value: FormData[typeof field]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: movie.tmdbId,
          rating: formData.rating,
          watchedOn: new Date(formData.watchedOn).toISOString(),
          rewatch: formData.rewatch,
          containsSpoiler: formData.containsSpoiler,
          tags: tags.length > 0 ? tags : undefined,
          reviewExcerpt: formData.reviewExcerpt.trim() || undefined,
          visibility: formData.visibility,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to log movie");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onLogged?.();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg panel max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-xl font-semibold">Log Movie</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-ink-muted hover:bg-surface-alt hover:text-foreground transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-4 border-b border-border p-4">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={80}
              height={120}
              className="w-20 rounded object-cover"
            />
          ) : (
            <div className="w-20 rounded bg-surface-alt" />
          )}
          <div>
            <h3 className="font-display text-lg font-semibold">{movie.title}</h3>
            <p className="text-sm text-ink-muted">{movie.year || "Unknown year"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="kicker block mb-2">
              Your Rating <span className="text-red-400">*</span>
            </label>
            <RatingInput value={formData.rating} onChange={handleRatingChange} size="lg" />
          </div>

          <div>
            <label className="kicker block mb-2">Watched On</label>
            <input
              type="date"
              value={formData.watchedOn}
              onChange={(e) => handleChange("watchedOn", e.target.value)}
              className="input"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rewatch}
                onChange={(e) => handleChange("rewatch", e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm">Rewatch</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.containsSpoiler}
                onChange={(e) => handleChange("containsSpoiler", e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm">Contains spoilers</span>
            </label>
          </div>

          <div>
            <label className="kicker block mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="horror, thriller, 2024"
              className="input"
            />
          </div>

          <div>
            <label className="kicker block mb-2">
              Review Excerpt <span className="text-ink-muted">(optional, {400 - formData.reviewExcerpt.length} remaining)</span>
            </label>
            <textarea
              value={formData.reviewExcerpt}
              onChange={(e) => {
                if (e.target.value.length <= 400) {
                  handleChange("reviewExcerpt", e.target.value);
                }
              }}
              placeholder="Your thoughts on this film..."
              className="textarea"
              rows={3}
            />
          </div>

          <div>
            <label className="kicker block mb-2">Visibility</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={formData.visibility === PrivacyLevel.PUBLIC}
                  onChange={() => handleChange("visibility", PrivacyLevel.PUBLIC)}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm">Public</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={formData.visibility === PrivacyLevel.FOLLOWERS}
                  onChange={() => handleChange("visibility", PrivacyLevel.FOLLOWERS)}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm">Followers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={formData.visibility === PrivacyLevel.PRIVATE}
                  onChange={() => handleChange("visibility", PrivacyLevel.PRIVATE)}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm">Private</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-400">Logged successfully!</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="button flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary flex-1"
              disabled={isSubmitting || formData.rating === 0}
            >
              {isSubmitting ? "Logging..." : "Log Film"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
