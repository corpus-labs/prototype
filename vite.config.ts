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
  fmt: {
    // Content files keep the house Markdown style the editor writes (core/markdown/style.ts).
    // A code formatter reads MDX as JSX and would reflow examples, so it leaves them alone.
    ignorePatterns: ["fixtures/**/*.mdx"],
  },
  plugins: lazyPlugins(() => [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])]),
  resolve: {
    alias: [
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
      // Framework-free code shared by the app and, from Phase 2, the server.
      { find: "@core", replacement: fileURLToPath(new URL("./core", import.meta.url)) },
      // The docs editor registers the languages it offers, so prism gets
      // refractor's empty core rather than the build with all 62.
      { find: /^refractor$/, replacement: "refractor/core" },
    ],
  },
  build: single ? { assetsInlineLimit: 100_000_000 } : undefined,
});
