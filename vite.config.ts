import { fileURLToPath, URL } from "node:url";
import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build:single` inlines every asset (JS, CSS, fonts) into one HTML file.
const single = Boolean(process.env.SINGLEFILE);

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  plugins: lazyPlugins(() => [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])]),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Framework-free code shared by the app and, from Phase 2, the server.
      "@core": fileURLToPath(new URL("./core", import.meta.url)),
    },
  },
  build: single ? { assetsInlineLimit: 100_000_000 } : undefined,
});
