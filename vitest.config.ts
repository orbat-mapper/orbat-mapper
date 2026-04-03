import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      silent: true,
      exclude: [...configDefaults.exclude, "e2e/**", ".claude/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
    },
  }),
);
