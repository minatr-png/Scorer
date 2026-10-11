"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Game, ScoreCategory } from "@/lib/types";
import { formatDate } from "@/lib/constants";
import ScoreBadge from "@/components/ScoreBadge";
import SortButtons from "@/components/SortButtons";
import EditGameModal from "@/components/EditGameModal";
import { AlertIcon, CheckIcon, GamepadIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/Icons";

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
        <h1 className="flex items-center text-3xl font-bold tracking-tight">
          <span className="inline-grid place-items-center w-10 h-10 mr-3 align-middle rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-[0_6px_18px_-4px_rgba(37,99,235,0.6),inset_0_1px_0_rgba(255,255,255,0.6)]">
            <GamepadIcon size={20} />
          </span>
          <span className="text-gradient">Games</span>
        </h1>
        <button
          onClick={openAdd}
          className="btn btn-primary px-5 py-2.5 text-sm"
        >
          <PlusIcon size={16} /> Add Game
        </button>
      </div>

      <div className="glass rounded-3xl p-3 sm:pl-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
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
          className="input-glass sm:ml-auto sm:w-60"
        />
      </div>

      {loading ? (
        <p className="glass rounded-3xl p-8 text-center text-slate-500">Loading…</p>
      ) : games.length === 0 ? (
        <p className="glass rounded-3xl p-8 text-center text-slate-500">No games yet. Add your first one!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedGames.map((game) => (
            <div
              key={game.id}
              className="glass glass-hover rounded-3xl flex gap-4 p-3 sm:p-4"
            >
              {game.picture ? (
                <img
                  src={game.picture}
                  alt={game.name}
                  className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-2xl flex-shrink-0 shadow-[0_8px_24px_-8px_rgba(15,27,61,0.45)] ring-1 ring-white/80"
                />
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-36 bg-white/60 border border-white rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-300">
                  <GamepadIcon size={32} />
                </div>
              )}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 text-lg leading-tight truncate">
                    {game.name}
                  </h3>
                  <ScoreBadge score={game.score_categories} />
                </div>
                <div className="text-sm text-slate-500 space-y-0.5">
                  <p>Started: {formatDate(game.start_date)}</p>
                  <p>Finished: {formatDate(game.finish_date)}</p>
                  {game.left && (
                    <p className="flex items-center gap-1.5 text-rose-600 font-medium"><AlertIcon size={14} /> Left unfinished</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  {!game.finish_date && (
                    <button
                      onClick={() => handleFinish(game.id)}
                      className="btn btn-success text-xs px-3.5 py-1.5"
                    >
                      <CheckIcon size={13} /> Finish
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(game)}
                    className="btn btn-glass text-xs px-3.5 py-1.5"
                  >
                    <PencilIcon size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="btn btn-danger text-xs px-3.5 py-1.5"
                  >
                    <TrashIcon size={13} /> Delete
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
