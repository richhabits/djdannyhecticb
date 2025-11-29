/**
 * Meta tags utility for Open Graph and Twitter Cards
 */

export interface MetaTags {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  siteName?: string;
}

const DEFAULT_IMAGE = "/og-default.png";
const DEFAULT_SITE_NAME = "Hectic Radio";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export function getMetaTags(meta: MetaTags): Array<{ name?: string; property?: string; content: string }> {
  const url = meta.url || BASE_URL;
  const image = meta.image || `${BASE_URL}${DEFAULT_IMAGE}`;
  const type = meta.type || "website";

  return [
    // Basic meta
    { name: "title", content: meta.title },
    { name: "description", content: meta.description },
    
    // Open Graph
    { property: "og:title", content: meta.title },
    { property: "og:description", content: meta.description },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:image", content: image },
    { property: "og:site_name", content: meta.siteName || DEFAULT_SITE_NAME },
    
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: meta.title },
    { name: "twitter:description", content: meta.description },
    { name: "twitter:image", content: image },
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

