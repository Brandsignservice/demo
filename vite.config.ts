import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dev and preview servers bind to 0.0.0.0 and accept the sandbox preview host.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: "0.0.0.0", allowedHosts: [".e2b.app"] },
  preview: { host: "0.0.0.0", allowedHosts: [".e2b.app"] },
  build: { target: "es2020", chunkSizeWarningLimit: 600 },
});
