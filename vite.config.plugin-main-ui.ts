import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src/plugin-main-ui",
  plugins: [reactRefresh(), viteSingleFile()],
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false,
    outDir: "../../dist/plugin/main-ui",
    rollupOptions: {
      inlineDynamicImports: true,
      output: {
        manualChunks: () => "everything.js",
      },
    },
  },
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "./src/lib"),
    },
  },
});
