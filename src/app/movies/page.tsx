"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Movie, ScoreCategory } from "@/lib/types";
import { formatDate } from "@/lib/constants";
import ScoreBadge from "@/components/ScoreBadge";
import SortButtons from "@/components/SortButtons";
import EditMovieModal from "@/components/EditMovieModal";
import { FilmIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/Icons";

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
        <h1 className="flex items-center text-3xl font-bold tracking-tight">
          <span className="inline-grid place-items-center w-10 h-10 mr-3 align-middle rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-[0_6px_18px_-4px_rgba(37,99,235,0.6),inset_0_1px_0_rgba(255,255,255,0.6)]">
            <FilmIcon size={20} />
          </span>
          <span className="text-gradient">Movies</span>
        </h1>
        <button
          onClick={openAdd}
          className="btn btn-primary px-5 py-2.5 text-sm"
        >
          <PlusIcon size={16} /> Add Movie
        </button>
      </div>

      <div className="glass rounded-3xl p-3 sm:pl-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
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
          className="input-glass sm:ml-auto sm:w-60"
        />
      </div>

      {loading ? (
        <p className="glass rounded-3xl p-8 text-center text-slate-500">Loading…</p>
      ) : movies.length === 0 ? (
        <p className="glass rounded-3xl p-8 text-center text-slate-500">No movies yet. Add your first one!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedMovies.map((movie) => (
            <div
              key={movie.id}
              className="glass glass-hover rounded-3xl flex gap-4 p-3 sm:p-4"
            >
              {movie.picture ? (
                <img
                  src={movie.picture}
                  alt={movie.name}
                  className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-2xl flex-shrink-0 shadow-[0_8px_24px_-8px_rgba(15,27,61,0.45)] ring-1 ring-white/80"
                />
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-36 bg-white/60 border border-white rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-300">
                  <FilmIcon size={32} />
                </div>
              )}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 text-lg leading-tight truncate">
                    {movie.name}
                  </h3>
                  <ScoreBadge score={movie.score_categories} />
                </div>
                <p className="text-sm text-slate-500">
                  Watched: {formatDate(movie.watch_date)}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(movie)}
                    className="btn btn-glass text-xs px-3.5 py-1.5"
                  >
                    <PencilIcon size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id)}
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
