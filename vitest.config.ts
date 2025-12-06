import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  test: {
    globals: true,
    include: [
      "client/**/*.test.ts",
      "client/**/*.test.tsx",
      "client/**/*.spec.ts",
      "client/**/*.spec.tsx",
      "server/**/*.test.ts",
      "server/**/*.spec.ts",
    ],
    // Use workspace projects for different environments
    environmentMatchGlobs: [
      ["server/**", "node"],
      ["client/**", "jsdom"],
    ],
    setupFiles: ["./client/src/test/setup.ts"],
  },
});
