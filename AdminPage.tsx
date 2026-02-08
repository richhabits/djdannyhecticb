/**
 * pages/AdminPage.tsx
 * Adds a Bulk Import (UK) control using radioBrowserService -> storageService.
 */
import React, { useEffect, useState } from "react";
import { getDB, subscribe, upsertCategory, upsertStation, deleteCategory, deleteStation, ensureCategories, upsertStationsBulk } from "../services/storageService";
import { fetchUKStations, probeStream } from "../services/radioBrowserService";

export default function AdminPage() {
  const [db, setDb] = useState(getDB());
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const addLog = (s: string) => setLog((x) => [s, ...x].slice(0, 200));

  useEffect(() => subscribe(setDb), []);

  async function globalSyncUK() {
    try {
      setBusy(true); addLog("Fetching UK stations…");
      const stations = await fetchUKStations();
      addLog(`Fetched ${stations.length} stations from Radio Browser.`);

      // Create categories and map to ids
      const prepared = [];
      for (const s of stations) {
        const catIds = ensureCategories(s.tags);
        prepared.push({
          stationuuid: s.stationuuid,
          name: s.name,
          streamUrl: s.streamUrl,
          homepage: s.homepage,
          favicon: s.favicon,
          city: s.city, country: s.country, language: s.language,
          codec: s.codec, bitrate: s.bitrate,
          tags: s.tags,
          categoryIds: catIds,
        });
      }

      const { created, updated } = upsertStationsBulk(prepared);
      addLog(`Upserted ${created} created, ${updated} updated.`);

      // Optional quick probe in batches of 10
      let okCount = 0, failCount = 0;
      addLog("Running quick health probes (first 20)…");
      for (let i=0; i<Math.min(20, prepared.length); i++) {
        const p = prepared[i];
        // eslint-disable-next-line no-await-in-loop
        const res = await probeStream(p.streamUrl);
        if (res.ok) okCount++; else failCount++;
      }
      addLog(`Health probes: OK ${okCount}, Fail ${failCount}`);
    } catch (e: any) {
      addLog("Import failed: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
      <h1 className="text-2xl font-semibold">Admin Console</h1>

      {/* Orchestration / Bulk Import */}
      <section className="rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">UK Global Import & Metadata Suite</h2>
            <p className="text-sm opacity-70">Fetches every GB station (HTTPS-only), creates categories from tags, upserts into the local DB.</p>
          </div>
          <button className="px-4 py-2 rounded bg-black text-white disabled:opacity-50" disabled={busy} onClick={globalSyncUK}>
            {busy ? "Importing…" : "Global Sync (UK)"}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-3">
            <div className="font-medium mb-2">Categories</div>
            <ul className="text-sm list-disc pl-5 max-h-48 overflow-auto">
              {db.categories.map(c => <li key={c.id}>{c.name}</li>)}
              {db.categories.length === 0 && <li className="opacity-60">None yet</li>}
            </ul>
          </div>
          <div className="rounded-lg border p-3">
            <div className="font-medium mb-2">Activity Log</div>
            <ul className="text-xs font-mono max-h-48 overflow-auto">
              {log.map((l,i)=><li key={i}>{l}</li>)}
              {log.length===0 && <li className="opacity-60">No activity yet</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* Simple management tables (optional extra) */}
      <section className="rounded-xl border p-4">
        <h2 className="font-semibold mb-3">Stations ({db.stations.length})</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {db.stations.slice(0,30).map(s => (
            <div key={s.id} className="rounded-lg border p-3 text-sm">
              <div className="font-medium truncate">{s.name}</div>
              <div className="opacity-70 truncate">{s.streamUrl}</div>
              <div className="opacity-70">{s.city || "—"}, {s.country || "—"} {s.language ? `• ${s.language}` : ""}</div>
              <div className="opacity-70">Codec: {s.codec || "?"} • {s.bitrate ? `${s.bitrate}kbps` : "?"}</div>
              <div className="mt-2 flex gap-2">
                <button className="text-red-600" onClick={()=>deleteStation(s.id)}>Delete</button>
                <a className="text-blue-600" href={s.homepage || "#"} target="_blank" rel="noreferrer">Homepage</a>
              </div>
            </div>
          ))}
          {db.stations.length===0 && <div className="opacity-60">No stations yet. Run Global Sync.</div>}
        </div>
      </section>
    </div>
  );
}
