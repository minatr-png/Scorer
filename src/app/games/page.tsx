"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Game, ScoreCategory } from "@/lib/types";
import { formatDate } from "@/lib/constants";
import ScoreBadge from "@/components/ScoreBadge";
import ScoreSelect from "@/components/ScoreSelect";
import SortButtons from "@/components/SortButtons";
import Modal from "@/components/Modal";
import CoverSearchModal from "@/components/CoverSearchModal";

type GameSort = "start_date" | "finish_date" | "score";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<ScoreCategory[]>([]);
  const [sortBy, setSortBy] = useState<GameSort>("start_date");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPicture, setFormPicture] = useState("");
  const [formStartDate, setFormStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formFinishDate, setFormFinishDate] = useState("");
  const [formLeft, setFormLeft] = useState(false);
  const [formScore, setFormScore] = useState<number | null>(null);
  const [coverModalOpen, setCoverModalOpen] = useState(false);

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
    if (sortBy === "start_date") {
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    }
    if (sortBy === "finish_date") {
      if (!a.finish_date && !b.finish_date) return 0;
      if (!a.finish_date) return 1;
      if (!b.finish_date) return -1;
      return new Date(b.finish_date).getTime() - new Date(a.finish_date).getTime();
    }
    // score
    const aOrder = a.score_categories?.order ?? 0;
    const bOrder = b.score_categories?.order ?? 0;
    return bOrder - aOrder;
  });

  function resetForm() {
    setFormName("");
    setFormPicture("");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormFinishDate("");
    setFormLeft(false);
    setFormScore(null);
    setEditingGame(null);
  }

  function openAdd() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(game: Game) {
    setEditingGame(game);
    setFormName(game.name);
    setFormPicture(game.picture);
    setFormStartDate(game.start_date);
    setFormFinishDate(game.finish_date ?? "");
    setFormLeft(game.left);
    setFormScore(game.score_id);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formName,
      picture: formPicture,
      start_date: formStartDate,
      finish_date: formFinishDate || null,
      left: formLeft,
      score_id: formScore,
    };

    if (editingGame) {
      await supabase.from("games").update(payload).eq("id", editingGame.id);
    } else {
      await supabase.from("games").insert(payload);
    }

    setModalOpen(false);
    resetForm();
    fetchGames();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this game?")) return;
    await supabase.from("games").delete().eq("id", id);
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

      <div className="mb-6">
        <SortButtons<GameSort>
          options={[
            { value: "start_date", label: "Start Date" },
            { value: "finish_date", label: "Finish Date" },
            { value: "score", label: "Score" },
          ]}
          current={sortBy}
          onChange={setSortBy}
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

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editingGame ? "Edit Game" : "Add Game"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Picture URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formPicture}
                onChange={(e) => setFormPicture(e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCoverModalOpen(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors whitespace-nowrap"
              >
                🔍 Search
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Finish Date
              </label>
              <input
                type="date"
                value={formFinishDate}
                onChange={(e) => setFormFinishDate(e.target.value)}
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="left"
              checked={formLeft}
              onChange={(e) => setFormLeft(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label htmlFor="left" className="text-sm text-gray-300">
              Left unfinished
            </label>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Score</label>
            <ScoreSelect
              categories={categories}
              value={formScore}
              onChange={setFormScore}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors"
          >
            {editingGame ? "Update Game" : "Add Game"}
          </button>
        </form>
      </Modal>

      <CoverSearchModal
        open={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        onSelect={(url) => setFormPicture(url)}
        initialQuery={formName}
        type="games"
      />
    </div>
  );
}
