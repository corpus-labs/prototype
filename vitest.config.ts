import { defineConfig, mergeConfig } from "vite-plus";

import viteConfig from "./vite.config.ts";

// Tests run through the app's Vite config, so aliases and import.meta.glob work the same.
// Most tests are plain Node. A file that needs a DOM opts in with `// @vitest-environment jsdom`.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ["core/**/*.test.ts", "src/**/*.test.ts", "src/**/*.test.tsx"],
    },
  }),
);
