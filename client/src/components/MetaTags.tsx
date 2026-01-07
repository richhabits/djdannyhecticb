/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { setMetaTags, MetaTags } from "@/lib/meta";

interface MetaTagsProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  canonical?: string;
  keywords?: string;
  robots?: string;
  siteName?: string;
}

export function MetaTagsComponent({
  title,
  description,
  url,
  image,
  type,
  canonical,
  keywords,
  robots,
  siteName,
}: MetaTagsProps) {
  const [location] = useLocation();
  const fullUrl = url || `${typeof window !== "undefined" ? window.location.origin : ""}${location}`;

  useEffect(() => {
    setMetaTags({
      title,
      description,
      url: fullUrl,
      image,
      type,
      canonical: canonical || fullUrl,
      keywords,
      robots,
      siteName,
    });
  }, [title, description, fullUrl, image, type, canonical, keywords, robots, siteName]);

  // Also set canonical link
  useEffect(() => {
    const canonicalUrl = canonical || fullUrl;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
  }, [canonical, fullUrl]);

  return null;
}

