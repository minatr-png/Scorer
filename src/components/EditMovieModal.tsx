"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Movie, ScoreCategory } from "@/lib/types";
import Modal from "@/components/Modal";
import ScoreSelect from "@/components/ScoreSelect";
import CoverSearchModal from "@/components/CoverSearchModal";
import ProxyImageWarning from "@/components/ProxyImageWarning";
import { ImageIcon, SearchIcon } from "@/components/Icons";

interface EditMovieModalProps {
  open: boolean;
  onClose: () => void;
  movie: Movie | null;
  categories: ScoreCategory[];
  onSaved: () => void;
  initialScoreId?: number | null;
}

export default function EditMovieModal({
  open,
  onClose,
  movie,
  categories,
  onSaved,
  initialScoreId,
}: EditMovieModalProps) {
  const [formName, setFormName] = useState("");
  const [formPicture, setFormPicture] = useState("");
  const [formScore, setFormScore] = useState<number | null>(null);
  const [formWatchDate, setFormWatchDate] = useState("");
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().split("T")[0];
    setFormName(movie?.name ?? "");
    setFormPicture(movie?.picture ?? "");
    setFormScore(movie ? movie.score_id : (initialScoreId ?? null));
    setFormWatchDate(movie?.watch_date ?? today);
  }, [open, movie, initialScoreId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
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
    } finally {
      setSaving(false);
    }
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
            <label className="label-glass">Name *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="input-glass"
            />
          </div>
          <div>
            <label className="label-glass">Picture URL</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={formPicture}
                onChange={(e) => setFormPicture(e.target.value)}
                placeholder="https://..."
                className="input-glass flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={() => setCoverModalOpen(true)}
                className="btn btn-glass px-4 py-2 text-sm"
              >
                <SearchIcon size={15} /> Search
              </button>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400!", "bg-blue-50/60"); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove("border-blue-400!", "bg-blue-50/60"); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-blue-400!", "bg-blue-50/60");
                const html = e.dataTransfer.getData("text/html");
                if (html) {
                  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
                  if (match?.[1] && match[1].startsWith("http")) { setFormPicture(match[1].trim()); return; }
                }
                const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
                if (url && url.startsWith("http")) setFormPicture(url.trim());
              }}
              className="rounded-2xl border-2 border-dashed border-blue-200 bg-white/35 p-2 text-center transition-colors"
            >
              {formPicture ? (
                <img src={formPicture} alt="Preview" className="max-h-40 mx-auto rounded-xl object-contain shadow-[0_8px_24px_-8px_rgba(15,27,61,0.4)]" />
              ) : (
                <div className="flex flex-col items-center gap-2 py-4 text-slate-400">
                  <ImageIcon size={26} className="text-blue-300" />
                  <p className="text-xs">Drag & drop an image here</p>
                </div>
              )}
            </div>
            <ProxyImageWarning url={formPicture} />
          </div>
          <div>
            <label className="label-glass">Watch Date</label>
            <input
              type="date"
              value={formWatchDate}
              onChange={(e) => setFormWatchDate(e.target.value)}
              className="input-glass"
            />
          </div>
          <div>
            <label className="label-glass">Score</label>
            <ScoreSelect categories={categories} value={formScore} onChange={setFormScore} />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary w-full py-2.5 text-sm"
          >
            {saving ? "Saving…" : movie ? "Update Movie" : "Add Movie"}
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
