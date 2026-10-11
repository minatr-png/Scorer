"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { supabase } from "@/lib/supabase";
import { Game, Movie, ScoreCategory } from "@/lib/types";
import { SCORE_HEX } from "@/lib/constants";
import EditGameModal from "@/components/EditGameModal";
import EditMovieModal from "@/components/EditMovieModal";
import { DownloadIcon, FilmIcon, GamepadIcon, TrophyIcon } from "@/components/Icons";
import { useSlidingPill } from "@/components/useSlidingPill";
import { proxyUrl } from "@/lib/imageProxy";

type TierMode = "games" | "movies";

interface TierItem {
  id: string;
  name: string;
  picture: string;
  score_id: number | null;
  date: string;
}

const THUMB = "w-16 h-16 rounded-xl ring-2 ring-white transition-transform group-hover:scale-105";

// Falls back to a name tile when the image host blocks the proxy, instead of a broken image (on screen and in the PNG).
function TierThumb({ item }: { item: TierItem }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!item.picture || failedUrl === item.picture) {
    return (
      <div className={`${THUMB} bg-blue-50 flex items-center justify-center overflow-hidden px-1 text-[10px] leading-tight text-slate-600 text-center shadow-[0_6px_16px_-6px_rgba(15,27,61,0.4)]`}>
        <span className="line-clamp-4">{item.name}</span>
      </div>
    );
  }

  return (
    <img
      src={proxyUrl(item.picture)}
      alt={item.name}
      className={`${THUMB} object-cover shadow-[0_6px_16px_-6px_rgba(15,27,61,0.5)]`}
      crossOrigin="anonymous"
      onError={() => setFailedUrl(item.picture)}
    />
  );
}

export default function TierListPage() {
  const [mode, setMode] = useState<TierMode>("games");
  const [games, setGames] = useState<Game[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<ScoreCategory[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<number | "unrated" | null>(null);
  const tierRef = useRef<HTMLDivElement>(null);
  const { containerRef: modeRef, pillRef: modePillRef } = useSlidingPill(mode);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Create modal state (for double-click on category)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCategoryId, setCreateCategoryId] = useState<number | null>(null);

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
  const ModeIcon = mode === "games" ? GamepadIcon : FilmIcon;

  function openEditItem(itemId: string) {
    if (mode === "games") {
      const found = games.find((g) => g.id === itemId);
      if (found) { setEditingGame(found); setEditModalOpen(true); }
    } else {
      const found = movies.find((m) => m.id === itemId);
      if (found) { setEditingMovie(found); setEditModalOpen(true); }
    }
  }

  function openCreateModal(categoryId: number) {
    setCreateCategoryId(categoryId);
    setCreateModalOpen(true);
  }

  async function handleDrop(scoreId: number | null) {
    if (!dragItemId) return;
    setDragItemId(null);
    setDropTarget(null);

    const table = mode === "games" ? "games" : "movies";
    await supabase.from(table).update({ score_id: scoreId }).eq("id", dragItemId);

    // Optimistic update
    if (mode === "games") {
      setGames((prev) =>
        prev.map((g) => (g.id === dragItemId ? { ...g, score_id: scoreId } : g))
      );
    } else {
      setMovies((prev) =>
        prev.map((m) => (m.id === dragItemId ? { ...m, score_id: scoreId } : m))
      );
    }
  }

  async function downloadPng() {
    if (!tierRef.current) return;
    try {
      const dataUrl = await toPng(tierRef.current, {
        backgroundColor: "#eef4ff",
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
        <h1 className="flex items-center text-3xl font-bold tracking-tight">
          <span className="inline-grid place-items-center w-10 h-10 mr-3 align-middle rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-[0_6px_18px_-4px_rgba(37,99,235,0.6),inset_0_1px_0_rgba(255,255,255,0.6)]">
            <TrophyIcon size={20} />
          </span>
          <span className="text-gradient">Tier List</span>
        </h1>
        <div className="flex gap-3 items-center flex-wrap">
          <div ref={modeRef} className="glass relative flex rounded-full p-1 gap-1">
            <span ref={modePillRef} className="pill-indicator" aria-hidden="true" />
            <button
              data-pill-key="games"
              aria-current={mode === "games"}
              onClick={() => setMode("games")}
              className="pill-item px-4 py-1.5 text-sm"
            >
              <GamepadIcon size={16} /> Games
            </button>
            <button
              data-pill-key="movies"
              aria-current={mode === "movies"}
              onClick={() => setMode("movies")}
              className="pill-item px-4 py-1.5 text-sm"
            >
              <FilmIcon size={16} /> Movies
            </button>
          </div>
          <select
            value={selectedYear ?? ""}
            onChange={(e) =>
              setSelectedYear(e.target.value ? Number(e.target.value) : null)
            }
            className="input-glass w-auto! rounded-full!"
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
            className="btn btn-primary px-5 py-2.5 text-sm"
          >
            <DownloadIcon size={16} /> Download PNG
          </button>
        </div>
      </div>

      {loading ? (
        <p className="glass rounded-3xl p-8 text-center text-slate-500">Loading…</p>
      ) : filteredItems.length === 0 ? (
        <p className="glass rounded-3xl p-8 text-center text-slate-500">
          No {modeLabel.toLowerCase()} found{selectedYear ? ` for ${selectedYear}` : ""}. Add {modeLabel.toLowerCase()} first!
        </p>
      ) : (
        <div
          ref={tierRef}
          className="rounded-3xl overflow-hidden border border-white p-2 sm:p-3 space-y-2 shadow-[inset_0_1px_0_#fff,0_20px_60px_-20px_rgba(37,99,235,0.35)]"
          style={{ background: "linear-gradient(160deg, #ffffff 0%, #eef4ff 55%, #dbeafe 100%)" }}
        >
          {/* Title inside the PNG */}
          <div className="px-4 pt-2 pb-1 text-center">
            <h2 className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-blue-950">
              <ModeIcon size={22} className="text-blue-600" /> {modeLabel} Tier List{selectedYear ? ` — ${selectedYear}` : ""}
            </h2>
          </div>

          {tiers.map(({ category, items: tierItems }) => {
            const hex = SCORE_HEX[category.name] ?? "#6b7280";
            const isOver = dropTarget === category.id;
            return (
              <div key={category.id} className="flex rounded-2xl overflow-hidden bg-white/70 border border-white shadow-[0_4px_14px_-6px_rgba(30,64,175,0.25)]">
                <div
                  className="gloss w-24 sm:w-32 shrink-0 flex items-center justify-center text-center font-bold text-sm px-2 py-3 cursor-pointer hover:brightness-110 transition"
                  style={{
                    backgroundColor: hex,
                    color:
                      category.order >= 5 && category.order <= 6
                        ? "#000"
                        : category.order <= 2
                        ? "#fff"
                        : "#000",
                  }}
                  onDoubleClick={() => openCreateModal(category.id)}
                  title="Double-click to add new item to this tier"
                >
                  {category.name}
                </div>
                <div
                  className={`flex flex-wrap gap-2 p-2 items-center flex-1 min-h-[72px] transition-colors ${isOver ? "bg-blue-100/80 shadow-[inset_0_0_0_2px_rgba(96,165,250,0.7)]" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDropTarget(category.id); }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={(e) => { e.preventDefault(); handleDrop(category.id); }}
                >
                  {tierItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative group cursor-grab active:cursor-grabbing"
                      title={item.name}
                      draggable
                      onDragStart={() => setDragItemId(item.id)}
                      onDragEnd={() => { setDragItemId(null); setDropTarget(null); }}
                      onDoubleClick={() => openEditItem(item.id)}
                    >
                      <TierThumb item={item} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {unrated.length > 0 && (
            <div className="flex rounded-2xl overflow-hidden bg-white/70 border border-white shadow-[0_4px_14px_-6px_rgba(30,64,175,0.25)]">
              <div className="gloss w-24 sm:w-32 shrink-0 flex items-center justify-center font-bold text-sm px-2 py-3 bg-slate-300 text-slate-700">
                Unrated
              </div>
              <div
                className={`flex flex-wrap gap-2 p-2 items-center flex-1 min-h-[72px] transition-colors ${dropTarget === "unrated" ? "bg-blue-100/80 shadow-[inset_0_0_0_2px_rgba(96,165,250,0.7)]" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDropTarget("unrated"); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => { e.preventDefault(); handleDrop(null); }}
              >
                {unrated.map((item) => (
                  <div
                    key={item.id}
                    className="relative group cursor-grab active:cursor-grabbing"
                    title={item.name}
                    draggable
                    onDragStart={() => setDragItemId(item.id)}
                    onDragEnd={() => { setDragItemId(null); setDropTarget(null); }}
                    onDoubleClick={() => openEditItem(item.id)}
                  >
                    <TierThumb item={item} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <EditGameModal
        open={editModalOpen && mode === "games"}
        onClose={() => { setEditModalOpen(false); setEditingGame(null); }}
        game={editingGame}
        categories={categories}
        onSaved={fetchData}
      />
      <EditMovieModal
        open={editModalOpen && mode === "movies"}
        onClose={() => { setEditModalOpen(false); setEditingMovie(null); }}
        movie={editingMovie}
        categories={categories}
        onSaved={fetchData}
      />

      {/* Create modals (for double-click on category) */}
      <EditGameModal
        open={createModalOpen && mode === "games"}
        onClose={() => { setCreateModalOpen(false); setCreateCategoryId(null); }}
        game={null}
        categories={categories}
        onSaved={fetchData}
        initialScoreId={createCategoryId}
      />
      <EditMovieModal
        open={createModalOpen && mode === "movies"}
        onClose={() => { setCreateModalOpen(false); setCreateCategoryId(null); }}
        movie={null}
        categories={categories}
        onSaved={fetchData}
        initialScoreId={createCategoryId}
      />
    </div>
  );
}
