"use client";

import { ScoreCategory } from "@/lib/types";
import { SCORE_COLORS } from "@/lib/constants";

interface ScoreBadgeProps {
  score: ScoreCategory | undefined | null;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  if (!score) {
    return (
      <span className="inline-block shrink-0 px-2.5 py-1 text-xs font-medium rounded-full bg-white/60 text-slate-500 border border-white/90 shadow-[inset_0_1px_0_#fff]">
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
      className={`gloss inline-block shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {score.name}
    </span>
  );
}
