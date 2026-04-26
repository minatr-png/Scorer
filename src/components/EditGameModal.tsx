"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Game, ScoreCategory } from "@/lib/types";
import Modal from "@/components/Modal";
import ScoreSelect from "@/components/ScoreSelect";
import CoverSearchModal from "@/components/CoverSearchModal";

interface EditGameModalProps {
  open: boolean;
  onClose: () => void;
  game: Game | null;
  categories: ScoreCategory[];
  onSaved: () => void;
}

export default function EditGameModal({
  open,
  onClose,
  game,
  categories,
  onSaved,
}: EditGameModalProps) {
  const [formName, setFormName] = useState("");
  const [formPicture, setFormPicture] = useState("");
  const [formScore, setFormScore] = useState<number | null>(null);
  const [formStartDate, setFormStartDate] = useState("");
  const [formFinishDate, setFormFinishDate] = useState("");
  const [formLeft, setFormLeft] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().split("T")[0];
    setFormName(game?.name ?? "");
    setFormPicture(game?.picture ?? "");
    setFormScore(game?.score_id ?? null);
    setFormStartDate(game?.start_date ?? today);
    setFormFinishDate(game?.finish_date ?? "");
    setFormLeft(game?.left ?? false);
  }, [open, game]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Finish Date</label>
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
              id="game-left"
              checked={formLeft}
              onChange={(e) => setFormLeft(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label htmlFor="game-left" className="text-sm text-gray-300">Left unfinished</label>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Score</label>
            <ScoreSelect categories={categories} value={formScore} onChange={setFormScore} />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors"
          >
            {game ? "Update Game" : "Add Game"}
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
