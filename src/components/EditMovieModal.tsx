"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Movie, ScoreCategory } from "@/lib/types";
import Modal from "@/components/Modal";
import ScoreSelect from "@/components/ScoreSelect";
import CoverSearchModal from "@/components/CoverSearchModal";

interface EditMovieModalProps {
  open: boolean;
  onClose: () => void;
  movie: Movie | null;
  categories: ScoreCategory[];
  onSaved: () => void;
}

export default function EditMovieModal({
  open,
  onClose,
  movie,
  categories,
  onSaved,
}: EditMovieModalProps) {
  const [formName, setFormName] = useState("");
  const [formPicture, setFormPicture] = useState("");
  const [formScore, setFormScore] = useState<number | null>(null);
  const [formWatchDate, setFormWatchDate] = useState("");
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().split("T")[0];
    setFormName(movie?.name ?? "");
    setFormPicture(movie?.picture ?? "");
    setFormScore(movie?.score_id ?? null);
    setFormWatchDate(movie?.watch_date ?? today);
  }, [open, movie]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formName,
      picture: formPicture,
      watch_date: /^\d{4}-\d{2}-\d{2}$/.test(formWatchDate) ? formWatchDate : null,
      score_id: formScore,
    };
    if (movie) {
      await supabase.from("movies").update(payload).eq("id", movie.id);
    } else {
      await supabase.from("movies").insert(payload);
    }
    onClose();
    onSaved();
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={movie ? "Edit Movie" : "Add Movie"}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            <label className="block text-sm text-gray-300 mb-1">Picture URL</label>
            <div className="flex gap-2 mb-2">
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
            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-500"); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove("border-blue-500"); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-blue-500");
                const html = e.dataTransfer.getData("text/html");
                if (html) {
                  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
                  if (match?.[1] && match[1].startsWith("http")) { setFormPicture(match[1].trim()); return; }
                }
                const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
                if (url && url.startsWith("http")) setFormPicture(url.trim());
              }}
              className="rounded border-2 border-dashed border-gray-700 p-2 text-center transition-colors"
            >
              {formPicture ? (
                <img src={formPicture} alt="Preview" className="max-h-40 mx-auto rounded object-contain" />
              ) : (
                <p className="text-xs text-gray-500 py-4">Drag & drop an image here</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Watch Date</label>
            <input
              type="date"
              value={formWatchDate}
              onChange={(e) => setFormWatchDate(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Score</label>
            <ScoreSelect categories={categories} value={formScore} onChange={setFormScore} />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors"
          >
            {movie ? "Update Movie" : "Add Movie"}
          </button>
        </form>
      </Modal>

      <CoverSearchModal
        open={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        onSelect={(url) => setFormPicture(url)}
        initialQuery={formName}
        type="movies"
      />
    </>
  );
}
