"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Movie, ScoreCategory } from "@/lib/types";
import { formatDate } from "@/lib/constants";
import ScoreBadge from "@/components/ScoreBadge";
import ScoreSelect from "@/components/ScoreSelect";
import SortButtons from "@/components/SortButtons";
import Modal from "@/components/Modal";

type MovieSort = "watch_date" | "score";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<ScoreCategory[]>([]);
  const [sortBy, setSortBy] = useState<MovieSort>("watch_date");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPicture, setFormPicture] = useState("");
  const [formWatchDate, setFormWatchDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formScore, setFormScore] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from("score_categories")
      .select("*")
      .order("order");
    if (data) setCategories(data);
  }, []);

  const fetchMovies = useCallback(async () => {
    const { data } = await supabase
      .from("movies")
      .select("*, score_categories(*)");
    if (data) setMovies(data as Movie[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchMovies();
  }, [fetchCategories, fetchMovies]);

  const sortedMovies = [...movies].sort((a, b) => {
    if (sortBy === "watch_date") {
      return new Date(b.watch_date).getTime() - new Date(a.watch_date).getTime();
    }
    // score
    const aOrder = a.score_categories?.order ?? 0;
    const bOrder = b.score_categories?.order ?? 0;
    return bOrder - aOrder;
  });

  function resetForm() {
    setFormName("");
    setFormPicture("");
    setFormWatchDate(new Date().toISOString().split("T")[0]);
    setFormScore(null);
    setEditingMovie(null);
  }

  function openAdd() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(movie: Movie) {
    setEditingMovie(movie);
    setFormName(movie.name);
    setFormPicture(movie.picture);
    setFormWatchDate(movie.watch_date);
    setFormScore(movie.score_id);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formName,
      picture: formPicture,
      watch_date: formWatchDate,
      score_id: formScore,
    };

    if (editingMovie) {
      await supabase.from("movies").update(payload).eq("id", editingMovie.id);
    } else {
      await supabase.from("movies").insert(payload);
    }

    setModalOpen(false);
    resetForm();
    fetchMovies();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this movie?")) return;
    await supabase.from("movies").delete().eq("id", id);
    fetchMovies();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">🎬 Movies</h1>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          + Add Movie
        </button>
      </div>

      <div className="mb-6">
        <SortButtons<MovieSort>
          options={[
            { value: "watch_date", label: "Watch Date" },
            { value: "score", label: "Score" },
          ]}
          current={sortBy}
          onChange={setSortBy}
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : movies.length === 0 ? (
        <p className="text-gray-400">No movies yet. Add your first one!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-600 transition-colors"
            >
              {movie.picture && (
                <img
                  src={movie.picture}
                  alt={movie.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-white text-lg leading-tight">
                    {movie.name}
                  </h3>
                  <ScoreBadge score={movie.score_categories} />
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Watched: {formatDate(movie.watch_date)}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(movie)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id)}
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
        title={editingMovie ? "Edit Movie" : "Add Movie"}
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
            <input
              type="url"
              value={formPicture}
              onChange={(e) => setFormPicture(e.target.value)}
              placeholder="https://..."
              className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Watch Date
            </label>
            <input
              type="date"
              value={formWatchDate}
              onChange={(e) => setFormWatchDate(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
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
            {editingMovie ? "Update Movie" : "Add Movie"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
