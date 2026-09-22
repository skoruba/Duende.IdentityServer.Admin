import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Deliberately separate from vite.config.ts - that one generates a dev
// certificate when it runs in serve mode, which a test run has no use for.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
