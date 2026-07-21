"use client";

import { Star } from "lucide-react";
import { useState } from "react";

type RatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
};

const sizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

export default function RatingInput({ value, onChange, size = "md", readonly = false }: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const iconSize = sizes[size];

  const displayValue = hoverValue ?? value;
  const stars = [1, 2, 3, 4, 5];

  function handleClick(rating: number) {
    if (readonly) return;
    onChange(rating);
  }

  function handleMouseEnter(rating: number) {
    if (readonly) return;
    setHoverValue(rating);
  }

  function handleMouseLeave() {
    setHoverValue(null);
  }

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={handleMouseLeave}>
      {stars.map((star) => {
        const fillPercentage = Math.min(Math.max((displayValue - (star - 1)) * 2, 0), 2) / 2;
        const isFilled = fillPercentage >= 1;
        const isHalfFilled = fillPercentage > 0 && fillPercentage < 1;

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            className={`relative transition-transform ${!readonly && "hover:scale-110"} ${readonly ? "cursor-default" : "cursor-pointer"}`}
            style={{ width: iconSize, height: iconSize }}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              size={iconSize}
              className="absolute inset-0 text-ink-muted/30"
              fill="currentColor"
            />
            {isFilled && <Star size={iconSize} className="absolute inset-0 text-amber-400" fill="currentColor" />}
            {isHalfFilled && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: iconSize / 2 }}>
                <Star size={iconSize} className="text-amber-400" fill="currentColor" />
              </div>
            )}
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-amber-400">
          {value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
