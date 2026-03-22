"use client";

import { useState, useEffect, useCallback } from "react";

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Search {type === "games" ? "Game" : "Movie"} Covers
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-gray-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${type}…`}
              className="flex-1 rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {loading ? "…" : "Search"}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-gray-400 text-center py-8">Searching…</p>
          ) : results.length === 0 && searched ? (
            <p className="text-gray-400 text-center py-8">No covers found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.cover)}
                  className="group text-left rounded overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors"
                >
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-1.5">
                    <p className="text-xs text-gray-200 leading-tight truncate group-hover:text-blue-400">
                      {item.title}
                    </p>
                    {item.year && (
                      <p className="text-xs text-gray-500">{item.year}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-gray-800">
            <button
              onClick={() => search(query, page - 1)}
              disabled={page <= 1 || loading}
              className="text-sm text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => search(query, page + 1)}
              disabled={page >= totalPages || loading}
              className="text-sm text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
