import { useEffect } from "react";
import { useLocation } from "wouter";
import { setMetaTags, MetaTags } from "@/lib/meta";

interface MetaTagsProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  siteName?: string;
}

export function MetaTagsComponent({
  title,
  description,
  url,
  image,
  type,
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
      siteName,
    });
  }, [title, description, fullUrl, image, type, siteName]);

  return null;
}

