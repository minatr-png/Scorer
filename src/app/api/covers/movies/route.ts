import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  const page = req.nextUrl.searchParams.get("page") ?? "1";

  if (!query) {
    return NextResponse.json({ results: [], total_pages: 0 });
  }

  if (!TMDB_KEY) {
    return NextResponse.json(
      { error: "TMDB_API_KEY not configured" },
      { status: 500 }
    );
  }

  const url = `${TMDB_BASE}/search/movie?api_key=${encodeURIComponent(TMDB_KEY)}&query=${encodeURIComponent(query)}&page=${encodeURIComponent(page)}`;
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: "TMDB request failed" },
      { status: res.status }
    );
  }

  const data = await res.json();

  const results = (data.results ?? [])
    .filter((m: { poster_path: string | null }) => m.poster_path)
    .map((m: { id: number; title: string; poster_path: string; release_date?: string }) => ({
      id: m.id,
      title: m.title,
      year: m.release_date?.slice(0, 4) ?? "",
      cover: `${IMG_BASE}${m.poster_path}`,
    }));

  return NextResponse.json({
    results,
    total_pages: data.total_pages ?? 0,
    page: data.page ?? 1,
  });
}
