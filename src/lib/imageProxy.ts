// Routes external images through our own origin so html-to-image can embed them in the PNG export.
// Some hosts (FilmAffinity, TV Tropes, Fandom…) sit behind a Cloudflare bot challenge and refuse
// server-side fetches, so the proxy returns an error for them and callers must handle onError.
export function proxyUrl(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
