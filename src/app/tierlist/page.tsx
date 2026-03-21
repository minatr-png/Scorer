"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { supabase } from "@/lib/supabase";
import { Game, Movie, ScoreCategory } from "@/lib/types";
import { SCORE_HEX } from "@/lib/constants";

type TierMode = "games" | "movies";

interface TierItem {
  id: string;
  name: string;
  picture: string;
  score_id: number | null;
  date: string;
}

export default function TierListPage() {
  const [mode, setMode] = useState<TierMode>("games");
  const [games, setGames] = useState<Game[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<ScoreCategory[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const tierRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [catRes, gameRes, movieRes] = await Promise.all([
      supabase.from("score_categories").select("*").order("order", { ascending: false }),
      supabase.from("games").select("*, score_categories(*)"),
      supabase.from("movies").select("*, score_categories(*)"),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (gameRes.data) setGames(gameRes.data as Game[]);
    if (movieRes.data) setMovies(movieRes.data as Movie[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive items and years from the current mode
  const items: TierItem[] =
    mode === "games"
      ? games.map((g) => ({ id: g.id, name: g.name, picture: g.picture, score_id: g.score_id, date: g.start_date }))
      : movies.map((m) => ({ id: m.id, name: m.name, picture: m.picture, score_id: m.score_id, date: m.watch_date }));

  // Recompute available years when mode or data changes
  useEffect(() => {
    const uniqueYears = [
      ...new Set(items.map((item) => new Date(item.date).getFullYear())),
    ].sort((a, b) => b - a);
    setYears(uniqueYears);
    if (uniqueYears.length > 0) {
      setSelectedYear((prev) => (prev && uniqueYears.includes(prev) ? prev : uniqueYears[0]));
    } else {
      setSelectedYear(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, games, movies]);

  const filteredItems = selectedYear
    ? items.filter((item) => new Date(item.date).getFullYear() === selectedYear)
    : items;

  // Group items by score category
  const tiers = categories.map((cat) => ({
    category: cat,
    items: filteredItems.filter((item) => item.score_id === cat.id),
  }));

  // Unrated items
  const unrated = filteredItems.filter((item) => !item.score_id);

  const modeLabel = mode === "games" ? "Games" : "Movies";
  const modeEmoji = mode === "games" ? "🎮" : "🎬";

  async function downloadPng() {
    if (!tierRef.current) return;
    try {
      const dataUrl = await toPng(tierRef.current, {
        backgroundColor: "#111827",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `tierlist-${mode}-${selectedYear ?? "all"}.png`;
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
          <div className="flex rounded overflow-hidden border border-gray-600">
            <button
              onClick={() => setMode("games")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                mode === "games"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              🎮 Games
            </button>
            <button
              onClick={() => setMode("movies")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                mode === "movies"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              🎬 Movies
            </button>
          </div>
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
      ) : filteredItems.length === 0 ? (
        <p className="text-gray-400">
          No {modeLabel.toLowerCase()} found{selectedYear ? ` for ${selectedYear}` : ""}. Add {modeLabel.toLowerCase()} first!
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
              {modeEmoji} {modeLabel} Tier List{selectedYear ? ` — ${selectedYear}` : ""}
            </h2>
          </div>

          {tiers.map(({ category, items: tierItems }) => {
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
                  {tierItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative group"
                      title={item.name}
                    >
                      {item.picture ? (
                        <img
                          src={item.picture}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-300 text-center px-1">
                          {item.name}
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
                {unrated.map((item) => (
                  <div
                    key={item.id}
                    className="relative group"
                    title={item.name}
                  >
                    {item.picture ? (
                      <img
                        src={item.picture}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-600 rounded flex items-center justify-center text-xs text-gray-300 text-center px-1">
                        {item.name}
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
