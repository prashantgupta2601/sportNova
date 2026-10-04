import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",        // Vercel default — dist folder
    emptyOutDir: true,
  },
  // No base override — Vercel serves from root "/"
  // No proxy — API calls go to VITE_API_URL in production
});
