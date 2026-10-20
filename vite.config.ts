import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    lib: {
      entry: "src/main.ts",
      name: "DavidsAdventure",
      formats: ["iife"],
      fileName: () => "game.js",
    },
    assetsInlineLimit: Infinity,
  },
});
