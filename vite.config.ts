import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import analyze from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // build: {
  //   rollupOptions: {
  //     plugins: [analyze({ template: "treemap" })],
  //   },
  // },
});
