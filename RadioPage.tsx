/**
 * pages/RadioPage.tsx
 * Displays stations from the LocalStorage DB with metadata chips and a global HTMLAudioElement.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getDB, subscribe, Station } from "../services/storageService";

type PlayerState = { stationId?: string; isPlaying: boolean; error?: string; };
const getGlobalAudio = () => { const w:any = window; if (!w.__hecticAudio) w.__hecticAudio = new Audio(); return w.__hecticAudio as HTMLAudioElement; }

export default function RadioPage() {
  const [db, setDb] = useState(getDB());
  useEffect(() => subscribe(setDb), []);

  const [state, setState] = useState<PlayerState>({ isPlaying: false });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = getGlobalAudio();
    const a = audioRef.current;
    a.preload = "none"; a.crossOrigin = "anonymous"; a.volume = 0.9;
    const onPlay = () => setState((s) => ({ ...s, isPlaying: true, error: undefined }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));
    const onError = () => setState((s) => ({ ...s, isPlaying: false, error: "Playback error" }));
    a.addEventListener("play", onPlay); a.addEventListener("pause", onPause); a.addEventListener("error", onError);
    return () => { a.removeEventListener("play", onPlay); a.removeEventListener("pause", onPause); a.removeEventListener("error", onError); };
  }, []);

  const play = (s: Station) => {
    const a = getGlobalAudio();
    if (a.src !== s.streamUrl) a.src = s.streamUrl;
    a.play().catch(() => setState((prev) => ({ ...prev, error: "Autoplay blocked—tap Play" })));
    setState({ stationId: s.id, isPlaying: true });
  };
  const pause = () => getGlobalAudio().pause();
  const current = useMemo(() => db.stations.find((s) => s.id === state.stationId), [db, state.stationId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Live Stations</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {db.stations.map((s) => (
          <div key={s.id} className="rounded-xl border p-4 flex flex-col gap-3">
            <div className="font-medium">{s.name}</div>
            <div className="text-xs opacity-70 break-all">{s.streamUrl}</div>
            <div className="text-xs opacity-70">{s.city ? `${s.city}, ` : ""}{s.country ?? ""} {s.language ? `• ${s.language}` : ""}</div>
            <div className="flex flex-wrap gap-1">
              {s.tags?.slice(0,3).map(t => <span key={t} className="text-[11px] px-2 py-1 rounded-full border">{t}</span>)}
              <span className="text-[11px] px-2 py-1 rounded-full border">Codec: {s.codec || "?"}</span>
              <span className="text-[11px] px-2 py-1 rounded-full border">{s.bitrate ? `${s.bitrate} kbps` : "Bitrate: ?"}</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded bg-black text-white" onClick={() => play(s)}>
                {state.isPlaying && state.stationId === s.id ? "Playing…" : "Play"}
              </button>
              {state.isPlaying && state.stationId === s.id && (
                <button className="px-3 py-2 rounded border" onClick={pause}>Pause</button>
              )}
              {s.homepage && <a className="px-3 py-2 rounded border" href={s.homepage} target="_blank" rel="noreferrer">Open</a>}
            </div>
          </div>
        ))}
        {db.stations.length===0 && <div className="opacity-60">No stations yet — run Global Sync in Admin.</div>}
      </div>

      {/* Mini player */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(680px,95vw)] rounded-2xl shadow border bg-white/90 backdrop-blur p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{current ? current.name : "No station selected"}</div>
            <div className="text-xs opacity-70 truncate">{current?.streamUrl ?? "Tap Play on any station"}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded bg-black text-white" onClick={() => (current ? pause() : null)} disabled={!state.isPlaying}>
              {state.isPlaying ? "Pause" : "Paused"}
            </button>
            <input type="range" min={0} max={1} step={0.01} defaultValue={0.9} onChange={(e) => (getGlobalAudio().volume = Number(e.target.value))} />
          </div>
        </div>
        {state.error && <div className="mt-2 text-xs text-red-600">{state.error}</div>}
      </div>
    </div>
  );
}
