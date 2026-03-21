export const SCORE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Red: { bg: "bg-red-600", text: "text-white", border: "border-red-700" },
  Yellow: { bg: "bg-yellow-400", text: "text-black", border: "border-yellow-500" },
  "Bronze Yellow": { bg: "bg-yellow-600", text: "text-white", border: "border-yellow-700" },
  Bronze: { bg: "bg-amber-700", text: "text-white", border: "border-amber-800" },
  "Silver Bronze": { bg: "bg-stone-400", text: "text-black", border: "border-stone-500" },
  Silver: { bg: "bg-gray-300", text: "text-black", border: "border-gray-400" },
  "Gold Silver": { bg: "bg-amber-300", text: "text-black", border: "border-amber-400" },
  Gold: { bg: "bg-yellow-500", text: "text-black", border: "border-yellow-600" },
  "Platinum Gold": { bg: "bg-cyan-300", text: "text-black", border: "border-cyan-400" },
  Platinum: { bg: "bg-cyan-100", text: "text-black", border: "border-cyan-200" },
};

export const SCORE_HEX: Record<string, string> = {
  Red: "#dc2626",
  Yellow: "#facc15",
  "Bronze Yellow": "#ca8a04",
  Bronze: "#b45309",
  "Silver Bronze": "#a8a29e",
  Silver: "#d1d5db",
  "Gold Silver": "#fcd34d",
  Gold: "#eab308",
  "Platinum Gold": "#67e8f9",
  Platinum: "#cffafe",
};

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
