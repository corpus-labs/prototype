import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  base: "./",
  // The support bot demo reads the prototype's sample help pages from ../fixtures.
  server: { fs: { allow: [".."] } },
  plugins: lazyPlugins(() => [
    react(),
    tailwindcss(),
    ...(process.env.SINGLEFILE ? [viteSingleFile()] : []),
  ]),
});
