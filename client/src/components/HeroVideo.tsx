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

import { useState } from "react";

interface HeroVideoProps {
  videoUrl?: string;
  fallbackImage?: string;
  className?: string;
}

export function HeroVideo({ videoUrl, fallbackImage = "/hero-video-placeholder.jpg", className = "" }: HeroVideoProps) {
  const [error, setError] = useState(false);

  if (!videoUrl || error) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-orange-900/40 to-amber-900/40 ${className}`}
        style={{
          backgroundImage: fallbackImage ? `url(${fallbackImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className={`w-full h-full object-cover ${className}`}
      onError={() => setError(true)}
    >
      <source src={videoUrl} type="video/mp4" />
      <source src={videoUrl} type="video/webm" />
    </video>
  );
}

