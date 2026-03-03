import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api/stt": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
