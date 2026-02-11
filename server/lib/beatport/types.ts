/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * Beatport API v4 Type Definitions
 */

export interface BeatportPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BeatportGenre {
  id: number;
  name: string;
  slug: string;
  enabled: boolean;
}

export interface BeatportSubGenre {
  id: number;
  name: string;
  slug: string;
  enabled: boolean;
  genre?: {
    id: number;
    name: string;
  };
}

export interface BeatportChart {
  id: number;
  name: string;
  slug: string;
  is_published: boolean;
  enabled: boolean;
  genre?: {
    id: number;
    name: string;
  };
  sub_genre?: {
    id: number;
    name: string;
  };
}

export interface BeatportArtist {
  id: number;
  name: string;
  slug: string;
}

export interface BeatportLabel {
  id: number;
  name: string;
  slug: string;
}

export interface BeatportRelease {
  id: number;
  name: string;
  slug: string;
  catalog_number?: string;
}

export interface BeatportKey {
  id: number;
  name: string;
  short_name: string;
}

export interface BeatportTrack {
  id: number;
  name: string;
  slug: string;
  mix_name?: string;
  title: string;
  bpm?: number;
  length?: string;
  length_ms?: number;
  genre?: BeatportGenre;
  sub_genre?: BeatportSubGenre;
  artists?: BeatportArtist[];
  remixers?: BeatportArtist[];
  release?: BeatportRelease;
  label?: BeatportLabel;
  key?: BeatportKey;
  published_date?: string;
  released_date?: string;
  exclusive?: boolean;
  pre_order?: boolean;
  preview_url?: string;
  sample_url?: string;
  image_url?: string;
}

export interface BeatportSearchResult {
  tracks?: BeatportPaginatedResponse<BeatportTrack>;
  artists?: BeatportPaginatedResponse<BeatportArtist>;
  releases?: BeatportPaginatedResponse<BeatportRelease>;
  labels?: BeatportPaginatedResponse<BeatportLabel>;
}

export interface BeatportArtistType {
  id: number;
  name: string;
}

export interface BeatportCommercialModelType {
  id: number;
  name: string;
}

export interface BeatportHealthCheck {
  status: string;
  version?: string;
}

// Query parameter types
export interface GenresQueryParams {
  page?: number;
  page_size?: number;
  enabled?: boolean;
}

export interface SubGenresQueryParams {
  page?: number;
  page_size?: number;
  enabled?: boolean;
  genre_id?: number;
}

export interface ChartsQueryParams {
  page?: number;
  page_size?: number;
  genre_id?: number;
  is_published?: boolean;
  enabled?: boolean;
}

export interface TracksQueryParams {
  page?: number;
  page_size?: number;
  genre_id?: number;
  sub_genre_id?: number;
  artist_id?: number;
  label_id?: number;
  release_id?: number;
  bpm_low?: number;
  bpm_high?: number;
  key_id?: number;
  preorder?: boolean;
  exclusive?: boolean;
}

export interface SearchQueryParams {
  q: string;
  page?: number;
  page_size?: number;
  type?: "tracks" | "artists" | "releases" | "labels";
}
