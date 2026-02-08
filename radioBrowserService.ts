/**
 * services/radioBrowserService.ts
 * Front-end client for the public Radio Browser directory.
 * Clean-room: no external deps. Assumes CORS is allowed (Radio Browser mirrors do).
 */
export type RadioBrowserRow = {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  tags: string;
  countrycode: string;
  state?: string;
  language?: string;
  favicon?: string;
  homepage?: string;
  bitrate?: number;
  codec?: string;
  lastcheckok?: number;
  lastchangetime?: string;
};

const MIRRORS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
  "https://gb1.api.radio-browser.info",
];

export type NormalizedStation = {
  stationuuid: string;
  name: string;
  streamUrl: string;
  homepage?: string;
  favicon?: string;
  country: string;
  state?: string;
  city?: string;
  language?: string;
  codec?: string;
  bitrate?: number;
  tags: string[];
};

const TAG_NORMALIZE: Record<string, string> = {
  "pop":"Pop","top 40":"Pop","charts":"Pop",
  "news":"News","talk":"Talk","speech":"Talk",
  "rock":"Rock","classic rock":"Rock","alternative rock":"Rock","alt rock":"Rock",
  "classical":"Classical","orchestral":"Classical",
  "jazz":"Jazz","blues":"Jazz",
  "dance":"Dance","edm":"Dance","house":"Dance","trance":"Dance","techno":"Dance",
  "hiphop":"Hip-Hop","hip-hop":"Hip-Hop","rap":"Hip-Hop",
  "rnb":"R&B","r&b":"R&B","soul":"R&B",
  "community":"Community","local":"Community",
  "sport":"Sport","sports":"Sport",
  "country":"Country","folk":"Folk",
  "ambient":"Ambient","chill":"Ambient",
  "lofi":"Lo-Fi","lo-fi":"Lo-Fi",
  "electronic":"Electronic","dubstep":"Electronic","drum and bass":"Electronic","dnb":"Electronic",
  "reggae":"Reggae","ska":"Reggae",
  "world":"World","afrobeats":"Afrobeats","latin":"Latin",
  "christian":"Christian","gospel":"Christian",
  "general":"General"
};

function mapTagsToCategories(raw: string): string[] {
  const out = new Set<string>();
  raw.split(",").map(t => t.trim()).filter(Boolean).forEach((tag) => {
    const key = tag.toLowerCase();
    if (TAG_NORMALIZE[key]) out.add(TAG_NORMALIZE[key]);
  });
  if (out.size === 0) out.add("General");
  return Array.from(out);
}

async function fetchFromMirror(path: string): Promise<any> {
  let lastErr: any = null;
  for (const base of MIRRORS) {
    try {
      const res = await fetch(base + path, { method: "GET" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error("All Radio Browser mirrors failed");
}

/**
 * Fetch all GB stations, filter to HTTPS-only live streams, and normalize.
 */
export async function fetchUKStations(): Promise<NormalizedStation[]> {
  const rows: RadioBrowserRow[] = await fetchFromMirror("/json/stations/bycountrycodeexact/GB");
  const out: NormalizedStation[] = [];
  for (const r of rows) {
    // Only HTTPS + live
    const ok = (r.lastcheckok ?? 0) === 1;
    const stream = (r.url_resolved || r.url || "").trim();
    if (!ok || !stream || !/^https:\/\//i.test(stream)) continue;
    out.push({
      stationuuid: r.stationuuid,
      name: r.name,
      streamUrl: stream,
      homepage: r.homepage || undefined,
      favicon: r.favicon || undefined,
      country: "UK",
      state: r.state || undefined,
      city: r.state || undefined,
      language: r.language || "en",
      codec: r.codec || undefined,
      bitrate: typeof r.bitrate === "number" ? r.bitrate : undefined,
      tags: mapTagsToCategories(r.tags || ""),
    });
  }
  return out;
}

/**
 * Light-weight connectivity probe. In browsers we can't use HEAD everywhere; instead try a small GET with Range.
 * Returns { ok, contentType?, codec? }
 */
export async function probeStream(url: string): Promise<{ ok: boolean; contentType?: string; codec?: string; }>
{
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-1024", "Icy-MetaData": "1" }, signal: ctrl.signal });
    clearTimeout(to);
    const ok = res.ok;
    const ct = res.headers.get("Content-Type") || undefined;
    let codec: string | undefined;
    const map: Record<string,string> = {
      "audio/mpeg": "MP3",
      "audio/aac": "AAC",
      "audio/aacp": "AAC+",
      "application/vnd.apple.mpegurl": "HLS",
      "audio/ogg": "OGG"
    };
    if (ct) for (const k of Object.keys(map)) if (ct.toLowerCase().includes(k)) codec = map[k];
    return { ok, contentType: ct, codec };
  } catch {
    return { ok: false };
  }
}
