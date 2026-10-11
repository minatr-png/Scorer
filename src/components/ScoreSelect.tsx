"use client";

import { ScoreCategory } from "@/lib/types";

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
      className="input-glass"
    >
      <option value="">Unrated</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
