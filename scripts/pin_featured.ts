/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

// scripts/pin_featured.ts
// Find and verify BBC stations for featuring

const API = process.env.API_BASE || "https://api.radiohectic.com";

// Fuzzy matchers for BBC stations (handles variants)
const BBC = [
  /^bbc\s*radio\s*1\s*xtra$/i,
  /^bbc\s*radio\s*1$/i,
  /^bbc\s*radio\s*2$/i,
  /^bbc\s*radio\s*6\s*music$/i,
  /^bbc\s*radio\s*1\s*dance$/i,
];

const BBC_NAMES = [
  "BBC Radio 1Xtra",
  "BBC Radio 1",
  "BBC Radio 2", 
  "BBC Radio 6 Music",
  "BBC Radio 1 Dance"
];

interface Station {
  id?: string | number;
  stationuuid?: string;
  name?: string;
}

(async () => {
  try {
    const response = await fetch(`${API}/v1/stations?country=GB&limit=1000`);
    const list: Station[] = await response.json();
    
    const picks = list.filter((s: Station) => 
      BBC.some(rx => rx.test((s.name || '').trim()))
    );
    
    const featured = picks.map((p: Station) => ({
      id: p.id || p.stationuuid,
      name: p.name
    }));
    
    console.log(JSON.stringify({ 
      found: featured.length,
      required: BBC.length,
      featured 
    }, null, 2));
    
    // Check for critical stations
    const has1Xtra = picks.some((p: Station) => 
      /1\s*xtra/i.test(p.name || '')
    );
    
    if (!has1Xtra) {
      console.error("\n❌ BBC Radio 1Xtra NOT FOUND!");
      console.log("Checking for variants...");
      const variants = list.filter((s: Station) => 
        /bbc.*1.*xtra|bbc.*xtra|1xtra/i.test(s.name || '')
      );
      if (variants.length > 0) {
        console.log("Found possible variants:");
        variants.forEach(v => console.log(`  - ${v.name} (${v.id || v.stationuuid})`));
      }
    }
    
    // Success if we found at least 4 BBC stations
    process.exit(picks.length >= 4 ? 0 : 1);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
