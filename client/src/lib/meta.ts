/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Meta tags utility for Open Graph and Twitter Cards
 */

export interface MetaTags {
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

const DEFAULT_IMAGE = "/og-default.png";
const DEFAULT_SITE_NAME = "Hectic Radio";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export function getMetaTags(meta: MetaTags): Array<{ name?: string; property?: string; content: string }> {
  const url = meta.url || BASE_URL;
  const image = meta.image || `${BASE_URL}${DEFAULT_IMAGE}`;
  const type = meta.type || "website";
  const canonicalUrl = meta.canonical || url;

  return [
    // Basic meta
    { name: "title", content: meta.title },
    { name: "description", content: meta.description },
    { name: "keywords", content: meta.keywords || "DJ Danny Hectic B, UK Garage, House Music, DJ, Music, Radio, Hectic Radio" },
    { name: "author", content: "DJ Danny Hectic B" },
    { name: "robots", content: meta.robots || "index, follow" },
    
    // Canonical URL
    { name: "canonical", content: canonicalUrl },
    { property: "og:url", content: canonicalUrl },
    
    // Open Graph
    { property: "og:title", content: meta.title },
    { property: "og:description", content: meta.description },
    { property: "og:type", content: type },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: meta.title },
    { property: "og:site_name", content: meta.siteName || DEFAULT_SITE_NAME },
    { property: "og:locale", content: "en_GB" },
    
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: meta.title },
    { name: "twitter:description", content: meta.description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: meta.title },
    
    // Additional SEO
    { name: "theme-color", content: "#FF6B00" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  ];
}

export function setMetaTags(meta: MetaTags) {
  if (typeof document === "undefined") return;

  const tags = getMetaTags(meta);
  
  // Update or create meta tags
  tags.forEach((tag) => {
    const selector = tag.name 
      ? `meta[name="${tag.name}"]`
      : `meta[property="${tag.property}"]`;
    
    let element = document.querySelector(selector) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement("meta");
      if (tag.name) {
        element.setAttribute("name", tag.name);
      }
      if (tag.property) {
        element.setAttribute("property", tag.property);
      }
      document.head.appendChild(element);
    }
    
    element.setAttribute("content", tag.content);
  });

  // Update page title
  document.title = meta.title;
}

