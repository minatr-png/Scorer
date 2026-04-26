"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Movie, ScoreCategory } from "@/lib/types";
import { formatDate } from "@/lib/constants";
import ScoreBadge from "@/components/ScoreBadge";
import SortButtons from "@/components/SortButtons";
import EditMovieModal from "@/components/EditMovieModal";

type MovieSort = "watch_date" | "score";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<ScoreCategory[]>([]);
  const [sortBy, setSortBy] = useState<MovieSort>("watch_date");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

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
    let result = 0;
    if (sortBy === "watch_date") {
      result = new Date(b.watch_date).getTime() - new Date(a.watch_date).getTime();
    } else {
      const aOrder = a.score_categories?.order ?? 0;
      const bOrder = b.score_categories?.order ?? 0;
      result = bOrder - aOrder;
    }
    return sortAsc ? -result : result;
  }).filter((movie) =>
    movie.name.toLowerCase().includes(filterName.toLowerCase())
  );

  function openAdd() {
    setEditingMovie(null);
    setModalOpen(true);
  }

  function openEdit(movie: Movie) {
    setEditingMovie(movie);
    setModalOpen(true);
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

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <SortButtons<MovieSort>
          options={[
            { value: "watch_date", label: "Watch Date" },
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
      ) : movies.length === 0 ? (
        <p className="text-gray-400">No movies yet. Add your first one!</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-800">
          {sortedMovies.map((movie) => (
            <div
              key={movie.id}
              className="flex gap-4 py-4 hover:bg-gray-900/50 transition-colors"
            >
              {movie.picture ? (
                <img
                  src={movie.picture}
                  alt={movie.name}
                  className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-36 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center text-gray-600 text-2xl">
                  🎬
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-white text-lg leading-tight truncate">
                    {movie.name}
                  </h3>
                  <ScoreBadge score={movie.score_categories} />
                </div>
                <p className="text-sm text-gray-400">
                  Watched: {formatDate(movie.watch_date)}
                </p>
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

      <EditMovieModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        movie={editingMovie}
        categories={categories}
        onSaved={fetchMovies}
      />
    </div>
  );
}
