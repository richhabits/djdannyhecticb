/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

// scripts/probe_streams.ts
// Health probe for radio station streams

const API = process.env.API_BASE || "https://api.radiohectic.com";
const COUNTRY = process.env.COUNTRY || "GB";
const LIMIT = Number(process.env.LIMIT || 500);

function isAudio(ct?: string | null) {
  return !!ct && /audio|mpegurl|aac|mp3|ogg|x-mpegurl|mpegurl/i.test(ct);
}

interface Station {
  stream_url?: string;
  url_resolved?: string;
  hls_url?: string;
  name?: string;
  id?: string | number;
}

(async () => {
  try {
    // Use native fetch (Node 18+)
    const listResponse = await fetch(`${API}/v1/stations?country=${COUNTRY}&limit=${LIMIT}`);
    const list: Station[] = await listResponse.json();
    
    let ok = 0, bad = 0;
    const badStations: string[] = [];
    
    for (const s of list) {
      const url = s.stream_url || s.url_resolved || s.hls_url;
      if (!url) { 
        bad++; 
        badStations.push(`${s.name || s.id || 'unknown'}: no URL`);
        continue; 
      }
      
      try {
        const res = await fetch(url, { 
          method: "HEAD",
          signal: AbortSignal.timeout(5000)
        });
        const ct = res.headers.get("content-type");
        const status = res.status;
        
        if ((status === 200 || status === 206) && isAudio(ct)) { 
          ok++; 
        } else {
          bad++;
          badStations.push(`${s.name || s.id || 'unknown'}: status=${status}, ct=${ct}`);
        }
      } catch (err) {
        bad++;
        badStations.push(`${s.name || s.id || 'unknown'}: ${err instanceof Error ? err.message : 'error'}`);
      }
    }
    
    const total = list.length;
    const badPercent = total > 0 ? (bad / total * 100).toFixed(1) : '0';
    
    console.log(JSON.stringify({ 
      total, 
      ok, 
      bad,
      badPercent: `${badPercent}%`,
      failThreshold: `${Math.ceil(total * 0.1)}` 
    }, null, 2));
    
    if (bad > 0 && bad <= 10) {
      console.log("\nFirst 10 bad stations:");
      badStations.slice(0, 10).forEach(s => console.log(`  - ${s}`));
    }
    
    // Exit 1 if >10% bad
    process.exit(bad > Math.ceil(total * 0.1) ? 1 : 0);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
