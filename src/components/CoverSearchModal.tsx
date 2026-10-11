"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, SearchIcon } from "@/components/Icons";

interface CoverResult {
  id: number;
  title: string;
  year: string;
  cover: string;
}

interface CoverSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  initialQuery: string;
  type: "games" | "movies";
}

export default function CoverSearchModal({
  open,
  onClose,
  onSelect,
  initialQuery,
  type,
}: CoverSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CoverResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setResults([]);
      setPage(1);
      setTotalPages(0);
      setSearched(false);
    }
  }, [open, initialQuery]);

  const search = useCallback(
    async (searchQuery: string, searchPage: number) => {
      if (!searchQuery.trim()) return;
      setLoading(true);
      setSearched(true);
      try {
        const res = await fetch(
          `/api/covers/${type}?q=${encodeURIComponent(searchQuery)}&page=${searchPage}`
        );
        const data = await res.json();
        setResults(data.results ?? []);
        setTotalPages(data.total_pages ?? 0);
        setPage(data.page ?? searchPage);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  // Auto-search on open if there's an initial query
  useEffect(() => {
    if (open && initialQuery.trim()) {
      search(initialQuery, 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(query, 1);
  }

  function handleSelect(url: string) {
    onSelect(url);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="modal-panel glass-strong rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/70">
          <h2 className="text-lg font-semibold text-slate-900">
            Search {type === "games" ? "Game" : "Movie"} Covers
          </h2>
          <button
            onClick={onClose}
            className="btn btn-glass w-8 h-8"
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-white/70">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${type}…`}
              className="input-glass flex-1 min-w-0"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-5 py-2 text-sm"
            >
              <SearchIcon size={15} /> {loading ? "…" : "Search"}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-slate-500 text-center py-8">Searching…</p>
          ) : results.length === 0 && searched ? (
            <p className="text-slate-500 text-center py-8">No covers found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.cover)}
                  className="glass glass-hover group text-left rounded-2xl overflow-hidden"
                >
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium text-slate-800 leading-tight truncate group-hover:text-blue-600">
                      {item.title}
                    </p>
                    {item.year && (
                      <p className="text-xs text-slate-400">{item.year}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-5 py-3 border-t border-white/70">
            <button
              onClick={() => search(query, page - 1)}
              disabled={page <= 1 || loading}
              className="btn btn-glass px-4 py-1.5 text-sm"
            >
              <ChevronLeftIcon size={15} /> Prev
            </button>
            <span className="text-sm text-slate-500 tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => search(query, page + 1)}
              disabled={page >= totalPages || loading}
              className="btn btn-glass px-4 py-1.5 text-sm"
            >
              Next <ChevronRightIcon size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
