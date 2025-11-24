import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const ROOT_DIR = path.resolve(import.meta.dirname, "client");
const PUBLIC_DIR = path.resolve(ROOT_DIR, "public");
const DIST_PUBLIC_DIR = path.resolve(import.meta.dirname, "dist/public");
const ENV_DIR = path.resolve(import.meta.dirname);

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

type HtmlEnvKey = "VITE_APP_TITLE" | "VITE_APP_LOGO" | "VITE_ANALYTICS_ENDPOINT" | "VITE_ANALYTICS_WEBSITE_ID";

const DEFAULT_HTML_ENV: Record<HtmlEnvKey, string> = {
  VITE_APP_TITLE: "DJ Danny Hectic B",
  VITE_APP_LOGO: "/dj-danny-bio.jpg",
  VITE_ANALYTICS_ENDPOINT: "",
  VITE_ANALYTICS_WEBSITE_ID: "",
};

const normalizeValue = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ENV_DIR, "");

  (Object.keys(DEFAULT_HTML_ENV) as HtmlEnvKey[]).forEach(key => {
    const next = normalizeValue(env[key], DEFAULT_HTML_ENV[key]);
    env[key] = next;
    process.env[key] = next;
  });

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(ROOT_DIR, "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    envDir: ENV_DIR,
    root: ROOT_DIR,
    publicDir: PUBLIC_DIR,
    build: {
      outDir: DIST_PUBLIC_DIR,
      emptyOutDir: true,
    },
    server: {
      host: true,
      allowedHosts: [
        ".manuspre.computer",
        ".manus.computer",
        ".manus-asia.computer",
        ".manuscomputer.ai",
        ".manusvm.computer",
        "localhost",
        "127.0.0.1",
      ],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
