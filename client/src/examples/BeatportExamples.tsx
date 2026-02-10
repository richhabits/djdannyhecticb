/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * Example: Using Beatport API Integration
 * 
 * This file demonstrates how to use the Beatport tRPC endpoints
 * from React components. Copy these examples to your actual components.
 */

import { trpc } from "../lib/trpc";
import { useState } from "react";

/**
 * Example 1: Display a list of genres
 */
export function BeatportGenres() {
  const { data, isLoading, error } = trpc.beatport.genres.useQuery({
    pageSize: 50,
  });

  if (isLoading) return <div>Loading genres...</div>;
  if (error) return <div>Error loading genres: {error.message}</div>;

  return (
    <div className="genres-grid">
      {data?.results.map((genre) => (
        <div key={genre.id} className="genre-card">
          <h3>{genre.name}</h3>
          <p>Slug: {genre.slug}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 2: Search for tracks
 */
export function BeatportTrackSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Simple debounce - in production, use a proper debounce hook
    setTimeout(() => setDebouncedQuery(value), 500);
  };

  const { data, isLoading } = trpc.beatport.search.useQuery(
    { 
      q: debouncedQuery,
      type: "tracks",
      pageSize: 20,
    },
    { 
      enabled: debouncedQuery.length > 2 // Only search if query is 3+ characters
    }
  );

  return (
    <div className="track-search">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search for tracks..."
        className="search-input"
      />

      {isLoading && <div>Searching...</div>}

      {data?.tracks && (
        <div className="track-results">
          <h2>Found {data.tracks.count} tracks</h2>
          {data.tracks.results.map((track) => (
            <div key={track.id} className="track-item">
              <div className="track-info">
                <h3>{track.title}</h3>
                <p className="artists">
                  {track.artists?.map((a) => a.name).join(", ")}
                </p>
                {track.label && <p className="label">{track.label.name}</p>}
                {track.bpm && <p className="bpm">{track.bpm} BPM</p>}
                {track.genre && <p className="genre">{track.genre.name}</p>}
              </div>
              {track.image_url && (
                <img src={track.image_url} alt={track.title} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Browse tracks by genre
 */
export function BeatportTracksByGenre() {
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>();
  
  // Get genres
  const { data: genresData } = trpc.beatport.genres.useQuery({
    pageSize: 50,
  });

  // Get tracks for selected genre
  const { data: tracksData, isLoading } = trpc.beatport.tracks.useQuery(
    {
      genreId: selectedGenreId,
      pageSize: 30,
    },
    {
      enabled: !!selectedGenreId,
    }
  );

  return (
    <div className="tracks-by-genre">
      <div className="genre-selector">
        <label>Select Genre:</label>
        <select
          value={selectedGenreId || ""}
          onChange={(e) => setSelectedGenreId(Number(e.target.value) || undefined)}
        >
          <option value="">-- Select a genre --</option>
          {genresData?.results.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div>Loading tracks...</div>}

      {tracksData && (
        <div className="track-list">
          <h2>{tracksData.count} tracks found</h2>
          {tracksData.results.map((track) => (
            <div key={track.id} className="track-card">
              <h3>{track.title}</h3>
              <p>{track.artists?.map((a) => a.name).join(", ")}</p>
              {track.release && <p>Release: {track.release.name}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Display charts
 */
export function BeatportCharts() {
  const [selectedChartId, setSelectedChartId] = useState<number | undefined>();

  // Get charts
  const { data: chartsData } = trpc.beatport.charts.useQuery({
    pageSize: 20,
  });

  // Get tracks for selected chart
  const { data: chartTracksData, isLoading } = trpc.beatport.chartTracks.useQuery(
    {
      chartId: selectedChartId!,
      pageSize: 100,
    },
    {
      enabled: !!selectedChartId,
    }
  );

  return (
    <div className="charts">
      <div className="charts-list">
        <h2>Beatport Charts</h2>
        {chartsData?.results.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setSelectedChartId(chart.id)}
            className={selectedChartId === chart.id ? "active" : ""}
          >
            {chart.name}
          </button>
        ))}
      </div>

      {selectedChartId && (
        <div className="chart-tracks">
          {isLoading && <div>Loading chart tracks...</div>}
          
          {chartTracksData && (
            <>
              <h2>Top {chartTracksData.count} Tracks</h2>
              <ol className="track-list">
                {chartTracksData.results.map((track, index) => (
                  <li key={track.id} className="track-item">
                    <span className="position">#{index + 1}</span>
                    <div className="track-details">
                      <h3>{track.title}</h3>
                      <p>{track.artists?.map((a) => a.name).join(", ")}</p>
                      <p className="label">{track.label?.name}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Advanced track filtering
 */
export function BeatportAdvancedSearch() {
  const [filters, setFilters] = useState({
    genreId: undefined as number | undefined,
    bpmLow: undefined as number | undefined,
    bpmHigh: undefined as number | undefined,
    exclusive: undefined as boolean | undefined,
  });

  const { data, isLoading } = trpc.beatport.tracks.useQuery(
    {
      genreId: filters.genreId,
      bpmLow: filters.bpmLow,
      bpmHigh: filters.bpmHigh,
      exclusive: filters.exclusive,
      pageSize: 50,
    },
    {
      enabled: !!(filters.genreId || filters.bpmLow || filters.bpmHigh),
    }
  );

  return (
    <div className="advanced-search">
      <div className="filters">
        <div className="filter-group">
          <label>BPM Range:</label>
          <input
            type="number"
            placeholder="Min BPM"
            value={filters.bpmLow || ""}
            onChange={(e) => setFilters(f => ({ ...f, bpmLow: Number(e.target.value) || undefined }))}
          />
          <input
            type="number"
            placeholder="Max BPM"
            value={filters.bpmHigh || ""}
            onChange={(e) => setFilters(f => ({ ...f, bpmHigh: Number(e.target.value) || undefined }))}
          />
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={filters.exclusive || false}
              onChange={(e) => setFilters(f => ({ ...f, exclusive: e.target.checked }))}
            />
            Exclusive tracks only
          </label>
        </div>
      </div>

      {isLoading && <div>Loading tracks...</div>}

      {data && (
        <div className="results">
          <p>Found {data.count} tracks</p>
          {data.results.map((track) => (
            <div key={track.id} className="track">
              <h3>{track.title}</h3>
              <p>BPM: {track.bpm}</p>
              {track.exclusive && <span className="badge">Exclusive</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
