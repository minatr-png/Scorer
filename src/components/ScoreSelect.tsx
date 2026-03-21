"use client";

import { ScoreCategory } from "@/lib/types";
import { SCORE_COLORS } from "@/lib/constants";

interface ScoreSelectProps {
  categories: ScoreCategory[];
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function ScoreSelect({ categories, value, onChange }: ScoreSelectProps) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
    >
      <option value="">Unrated</option>
      {categories.map((cat) => {
        const colors = SCORE_COLORS[cat.name];
        return (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        );
      })}
    </select>
  );
}
