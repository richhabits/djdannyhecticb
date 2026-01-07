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

/**
 * Copy Protection Module
 * Protects intellectual property and prevents unauthorized copying
 */
export function initCopyProtection() {
  // Disable right-click context menu
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });

  // Disable common keyboard shortcuts for copying
  document.addEventListener("keydown", (e) => {
    // Disable Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, Ctrl+U, F12, Ctrl+Shift+I
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "c" || e.key === "a" || e.key === "s" || e.key === "p" || e.key === "u" || e.key === "i")
    ) {
      // Allow in development mode
      if (import.meta.env.DEV) {
        return;
      }
      e.preventDefault();
      return false;
    }

    // Disable F12 (Developer Tools)
    if (e.key === "F12") {
      if (import.meta.env.DEV) {
        return;
      }
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+I and Ctrl+Shift+J
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "J")) {
      if (import.meta.env.DEV) {
        return;
      }
      e.preventDefault();
      return false;
    }
  });

  // Disable text selection (optional - can be too aggressive)
  // Uncomment if you want to completely disable text selection
  /*
  document.addEventListener("selectstart", (e) => {
    if (import.meta.env.DEV) {
      return;
    }
    e.preventDefault();
    return false;
  });
  */

  // Add watermark to images
  const style = document.createElement("style");
  style.textContent = `
    img {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      pointer-events: auto;
    }
    
    /* Disable drag and drop */
    img, video, audio {
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
      user-drag: none;
    }
  `;
  document.head.appendChild(style);

  // Detect DevTools (basic detection)
  let devtools = { open: false };
  const element = new Image();
  Object.defineProperty(element, "id", {
    get: function () {
      if (!import.meta.env.DEV) {
        devtools.open = true;
        // Optionally redirect or show warning
        console.clear();
        console.log("%c⚠️ UNAUTHORIZED ACCESS DETECTED", "color: red; font-size: 20px; font-weight: bold;");
        console.log("%cThis is proprietary software. Unauthorized access is prohibited.", "color: red; font-size: 14px;");
      }
    },
  });

  // Clear console periodically
  if (!import.meta.env.DEV) {
    setInterval(() => {
      if (devtools.open) {
        console.clear();
        console.log("%c⚠️ UNAUTHORIZED ACCESS DETECTED", "color: red; font-size: 20px; font-weight: bold;");
        console.log("%cCopyright (c) 2024 DJ Danny Hectic B / Hectic Radio. All rights reserved.", "color: red;");
      }
    }, 1000);
  }

  // Add copyright notice to console
  if (!import.meta.env.DEV) {
    console.log(
      "%c⚠️ COPYRIGHT NOTICE",
      "color: #ff6b00; font-size: 16px; font-weight: bold;"
    );
    console.log(
      "%cCopyright (c) 2024 DJ Danny Hectic B / Hectic Radio\nAll rights reserved.\nUnauthorized copying, distribution, or use prohibited.",
      "color: #ff6b00; font-size: 12px;"
    );
  }
}

/**
 * Add copyright watermark to page
 */
export function addCopyrightWatermark() {
  const watermark = document.createElement("div");
  watermark.id = "hectic-copyright-watermark";
  watermark.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    font-size: 10px;
    color: rgba(255, 107, 0, 0.3);
    pointer-events: none;
    user-select: none;
    z-index: 9999;
    font-family: monospace;
  `;
  watermark.textContent = "© 2024 DJ Danny Hectic B / Hectic Radio";
  document.body.appendChild(watermark);
}

