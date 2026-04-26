"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Game, ScoreCategory } from "@/lib/types";
import { formatDate } from "@/lib/constants";
import ScoreBadge from "@/components/ScoreBadge";
import SortButtons from "@/components/SortButtons";
import EditGameModal from "@/components/EditGameModal";

type GameSort = "start_date" | "finish_date" | "score";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<ScoreCategory[]>([]);
  const [sortBy, setSortBy] = useState<GameSort>("start_date");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from("score_categories")
      .select("*")
      .order("order");
    if (data) setCategories(data);
  }, []);

  const fetchGames = useCallback(async () => {
    const { data } = await supabase
      .from("games")
      .select("*, score_categories(*)");
    if (data) setGames(data as Game[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchGames();
  }, [fetchCategories, fetchGames]);

  const sortedGames = [...games].sort((a, b) => {
    let result = 0;
    if (sortBy === "start_date") {
      result = new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    } else if (sortBy === "finish_date") {
      if (!a.finish_date && !b.finish_date) result = 0;
      else if (!a.finish_date) result = 1;
      else if (!b.finish_date) result = -1;
      else result = new Date(b.finish_date).getTime() - new Date(a.finish_date).getTime();
    } else {
      const aOrder = a.score_categories?.order ?? 0;
      const bOrder = b.score_categories?.order ?? 0;
      result = bOrder - aOrder;
    }
    return sortAsc ? -result : result;
  }).filter((game) =>
    game.name.toLowerCase().includes(filterName.toLowerCase())
  );

  function openAdd() {
    setEditingGame(null);
    setModalOpen(true);
  }

  function openEdit(game: Game) {
    setEditingGame(game);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this game?")) return;
    await supabase.from("games").delete().eq("id", id);
    fetchGames();
  }

  async function handleFinish(id: string) {
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("games").update({ finish_date: today, left: false }).eq("id", id);
    fetchGames();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">🎮 Games</h1>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          + Add Game
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <SortButtons<GameSort>
          options={[
            { value: "start_date", label: "Start Date" },
            { value: "finish_date", label: "Finish Date" },
            { value: "score", label: "Score" },
          ]}
          current={sortBy}
          onChange={setSortBy}
          ascending={sortAsc}
          onToggleOrder={() => setSortAsc((v) => !v)}
        />
        <input
          type="text"
          placeholder="Filter by name…"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none sm:ml-auto sm:w-56"
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : games.length === 0 ? (
        <p className="text-gray-400">No games yet. Add your first one!</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-800">
          {sortedGames.map((game) => (
            <div
              key={game.id}
              className="flex gap-4 py-4 hover:bg-gray-900/50 transition-colors"
            >
              {game.picture ? (
                <img
                  src={game.picture}
                  alt={game.name}
                  className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-36 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center text-gray-600 text-2xl">
                  🎮
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-white text-lg leading-tight truncate">
                    {game.name}
                  </h3>
                  <ScoreBadge score={game.score_categories} />
                </div>
                <div className="text-sm text-gray-400 space-y-0.5">
                  <p>Started: {formatDate(game.start_date)}</p>
                  <p>Finished: {formatDate(game.finish_date)}</p>
                  {game.left && (
                    <p className="text-red-400 font-medium">⚠ Left unfinished</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  {!game.finish_date && (
                    <button
                      onClick={() => handleFinish(game.id)}
                      className="text-xs bg-green-900/50 hover:bg-green-900 text-green-300 px-3 py-1.5 rounded transition-colors"
                    >
                      ✓ Finish
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(game)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="text-xs bg-red-900/50 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditGameModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        game={editingGame}
        categories={categories}
        onSaved={fetchGames}
      />
    </div>
  );
}
