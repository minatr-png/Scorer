import { NextRequest, NextResponse } from "next/server";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const IGDB_BASE = "https://api.igdb.com/v4";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(TWITCH_CLIENT_ID!)}&client_secret=${encodeURIComponent(TWITCH_CLIENT_SECRET!)}&grant_type=client_credentials`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to get Twitch token");

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = 12;

  if (!query) {
    return NextResponse.json({ results: [], total_pages: 0 });
  }

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET not configured" },
      { status: 500 }
    );
  }

  try {
    const token = await getAccessToken();
    const fetchLimit = 50; // Fetch more from IGDB, then filter/sort locally
    const offset = (page - 1) * fetchLimit;

    // First get count
    const countRes = await fetch(`${IGDB_BASE}/games/count`, {
      method: "POST",
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search "${query.replace(/"/g, '\\"')}"; where cover != null;`,
    });
    const countData = await countRes.json();
    const totalCount = countData.count ?? 0;

    // Then fetch results with covers
    const res = await fetch(`${IGDB_BASE}/games`, {
      method: "POST",
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search "${query.replace(/"/g, '\\"')}"; fields name, cover.image_id, first_release_date; where cover != null; limit ${fetchLimit}; offset ${offset};`,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "IGDB request failed" },
        { status: res.status }
      );
    }

    const games = await res.json();

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(Boolean);

    const mapped = (games ?? [])
      .filter((g: { cover?: { image_id?: string } }) => g.cover?.image_id)
      .map((g: { id: number; name: string; cover: { image_id: string }; first_release_date?: number }) => ({
        id: g.id,
        title: g.name,
        year: g.first_release_date
          ? new Date(g.first_release_date * 1000).getFullYear().toString()
          : "",
        cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`,
      }))
      .sort((a: { title: string }, b: { title: string }) => {
        const aLower = a.title.toLowerCase();
        const bLower = b.title.toLowerCase();
        // Exact match
        const aExact = aLower === queryLower ? 0 : 1;
        const bExact = bLower === queryLower ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;
        // Contains full query
        const aContains = aLower.includes(queryLower) ? 0 : 1;
        const bContains = bLower.includes(queryLower) ? 0 : 1;
        if (aContains !== bContains) return aContains - bContains;
        // Count how many query words appear in the title
        const aWordHits = queryWords.filter((w) => aLower.includes(w)).length;
        const bWordHits = queryWords.filter((w) => bLower.includes(w)).length;
        if (aWordHits !== bWordHits) return bWordHits - aWordHits;
        // Shorter title = closer match
        const aLen = Math.abs(a.title.length - query.length);
        const bLen = Math.abs(b.title.length - query.length);
        return aLen - bLen;
      });

    const results = mapped.slice(0, pageSize);

    return NextResponse.json({
      results,
      total_pages: Math.ceil(totalCount / pageSize),
      page,
    });
  } catch (err) {
    console.error("IGDB error:", err);
    return NextResponse.json(
      { error: "IGDB request failed" },
      { status: 500 }
    );
  }
}
