"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Game, ScoreCategory } from "@/lib/types";
import Modal from "@/components/Modal";
import ScoreSelect from "@/components/ScoreSelect";
import CoverSearchModal from "@/components/CoverSearchModal";
import ProxyImageWarning from "@/components/ProxyImageWarning";
import { ImageIcon, SearchIcon } from "@/components/Icons";

interface EditGameModalProps {
  open: boolean;
  onClose: () => void;
  game: Game | null;
  categories: ScoreCategory[];
  onSaved: () => void;
  initialScoreId?: number | null;
}

export default function EditGameModal({
  open,
  onClose,
  game,
  categories,
  onSaved,
  initialScoreId,
}: EditGameModalProps) {
  const [formName, setFormName] = useState("");
  const [formPicture, setFormPicture] = useState("");
  const [formScore, setFormScore] = useState<number | null>(null);
  const [formStartDate, setFormStartDate] = useState("");
  const [formFinishDate, setFormFinishDate] = useState("");
  const [formLeft, setFormLeft] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().split("T")[0];
    setFormName(game?.name ?? "");
    setFormPicture(game?.picture ?? "");
    setFormScore(game ? game.score_id : (initialScoreId ?? null));
    setFormStartDate(game?.start_date ?? today);
    setFormFinishDate(game?.finish_date ?? "");
    setFormLeft(game?.left ?? false);
  }, [open, game, initialScoreId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        name: formName,
        picture: formPicture,
        start_date: /^\d{4}-\d{2}-\d{2}$/.test(formStartDate) ? formStartDate : null,
        finish_date: (/^\d{4}-\d{2}-\d{2}$/.test(formFinishDate) ? formFinishDate : null) || null,
        left: formLeft,
        score_id: formScore,
      };
      if (game) {
        await supabase.from("games").update(payload).eq("id", game.id);
      } else {
        await supabase.from("games").insert(payload);
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
        title={game ? "Edit Game" : "Add Game"}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-glass">Start Date</label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="input-glass"
              />
            </div>
            <div>
              <label className="label-glass">Finish Date</label>
              <input
                type="date"
                value={formFinishDate}
                onChange={(e) => setFormFinishDate(e.target.value)}
                className="input-glass"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="game-left"
              checked={formLeft}
              onChange={(e) => setFormLeft(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="game-left" className="text-sm text-slate-600">Left unfinished</label>
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
            {saving ? "Saving…" : game ? "Update Game" : "Add Game"}
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
    </>
  );
}
