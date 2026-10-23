import { defineConfig } from "vite";
export default defineConfig(({ mode }) => ({
  base: "./",
  build:
    mode === "pages"
      ? {
          outDir: "pages-dist",
          target: "es2020",
          assetsInlineLimit: 0,
        }
      : {
          target: "es2020",
          lib: {
            entry: "src/main.ts",
            name: "DavidsAdventure",
            formats: ["iife"],
            fileName: () => "game.js",
          },
          assetsInlineLimit: Infinity,
        },
}));
