"use client";

import { ScoreCategory } from "@/lib/types";
import { SCORE_COLORS } from "@/lib/constants";

interface ScoreBadgeProps {
  score: ScoreCategory | undefined | null;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  if (!score) {
    return (
      <span className="inline-block px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
        Unrated
      </span>
    );
  }

  const colors = SCORE_COLORS[score.name] ?? {
    bg: "bg-gray-500",
    text: "text-white",
    border: "border-gray-600",
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {score.name}
    </span>
  );
}
