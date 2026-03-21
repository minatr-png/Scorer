"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { supabase } from "@/lib/supabase";
import { Game, ScoreCategory } from "@/lib/types";
import { SCORE_HEX } from "@/lib/constants";

export default function TierListPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<ScoreCategory[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const tierRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const [catRes, gameRes] = await Promise.all([
      supabase.from("score_categories").select("*").order("order", { ascending: false }),
      supabase.from("games").select("*, score_categories(*)"),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (gameRes.data) {
      const g = gameRes.data as Game[];
      setGames(g);
      const uniqueYears = [
        ...new Set(g.map((game) => new Date(game.start_date).getFullYear())),
      ].sort((a, b) => b - a);
      setYears(uniqueYears);
      if (uniqueYears.length > 0 && selectedYear === null) {
        setSelectedYear(uniqueYears[0]);
      }
    }
    setLoading(false);
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredGames = selectedYear
    ? games.filter(
        (g) => new Date(g.start_date).getFullYear() === selectedYear
      )
    : games;

  // Group games by score category
  const tiers = categories.map((cat) => ({
    category: cat,
    games: filteredGames.filter((g) => g.score_id === cat.id),
  }));

  // Unrated games
  const unrated = filteredGames.filter((g) => !g.score_id);

  async function downloadPng() {
    if (!tierRef.current) return;
    try {
      const dataUrl = await toPng(tierRef.current, {
        backgroundColor: "#111827",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `tierlist-games-${selectedYear ?? "all"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export tier list", err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">🏆 Tier List</h1>
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={selectedYear ?? ""}
            onChange={(e) =>
              setSelectedYear(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={downloadPng}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            ⬇ Download PNG
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : filteredGames.length === 0 ? (
        <p className="text-gray-400">
          No games found{selectedYear ? ` for ${selectedYear}` : ""}. Add games
          first!
        </p>
      ) : (
        <div
          ref={tierRef}
          className="rounded-lg overflow-hidden border border-gray-700"
          style={{ backgroundColor: "#111827" }}
        >
          {/* Title inside the PNG */}
          <div className="px-4 py-3 text-center">
            <h2 className="text-xl font-bold text-white">
              Games Tier List{selectedYear ? ` — ${selectedYear}` : ""}
            </h2>
          </div>

          {tiers.map(({ category, games: tierGames }) => {
            if (tierGames.length === 0) return null;
            const hex = SCORE_HEX[category.name] ?? "#6b7280";
            return (
              <div key={category.id} className="flex border-t border-gray-700">
                <div
                  className="w-32 shrink-0 flex items-center justify-center font-bold text-sm px-2 py-3"
                  style={{
                    backgroundColor: hex,
                    color:
                      category.order >= 5 && category.order <= 6
                        ? "#000"
                        : category.order <= 2
                        ? "#fff"
                        : "#000",
                  }}
                >
                  {category.name}
                </div>
                <div className="flex flex-wrap gap-2 p-2 items-center flex-1 min-h-[60px]">
                  {tierGames.map((game) => (
                    <div
                      key={game.id}
                      className="relative group"
                      title={game.name}
                    >
                      {game.picture ? (
                        <img
                          src={game.picture}
                          alt={game.name}
                          className="w-16 h-16 object-cover rounded"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-300 text-center px-1">
                          {game.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {unrated.length > 0 && (
            <div className="flex border-t border-gray-700">
              <div className="w-32 shrink-0 flex items-center justify-center font-bold text-sm px-2 py-3 bg-gray-700 text-gray-300">
                Unrated
              </div>
              <div className="flex flex-wrap gap-2 p-2 items-center flex-1 min-h-[60px]">
                {unrated.map((game) => (
                  <div
                    key={game.id}
                    className="relative group"
                    title={game.name}
                  >
                    {game.picture ? (
                      <img
                        src={game.picture}
                        alt={game.name}
                        className="w-16 h-16 object-cover rounded"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-600 rounded flex items-center justify-center text-xs text-gray-300 text-center px-1">
                        {game.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
