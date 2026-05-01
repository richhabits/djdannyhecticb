/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const plugins = [
  react(),
  tailwindcss(),
  visualizer({
    open: false,
    gzipSize: true,
    brotliSize: true,
    filename: "bundle-analysis.html",
  }),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    minify: "esbuild",
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 2000,
    // Performance optimization: code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendors for better caching
          "vendor-react": ["react", "react-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
          ],
          "vendor-icons": ["lucide-react"],
          "vendor-charts": ["recharts"],
          "vendor-forms": ["react-hook-form", "zod"],
          "vendor-utils": ["clsx", "date-fns", "nanoid"],
        },
      },
    },
    // Target modern browsers for better performance
    target: "ES2020",
    // Terser options for smaller output
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ["console.log"],
      },
      format: {
        comments: false,
      },
    },
    // Increase size warnings
    sourcemap: false,
  },
});
