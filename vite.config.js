import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev UI talks to the deployed API by default, so a plain `npm run dev`
// shows live data. Point it at a local server to exercise server changes
// before they ship:  VITE_API_TARGET=http://localhost:5174 npm run dev:client
// (log in again — a local API signs tokens with the local AUTH_SECRET).
const API_TARGET = process.env.VITE_API_TARGET || "https://dashsimple.onrender.com";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        ws: false,
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            const code = err?.code || "ERR";
             
            console.warn(`[proxy ${code}] ${_req?.url || ""}`);
            if (res && !res.headersSent) {
              try {
                res.writeHead(502, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: `Upstream unreachable (${code})` }));
              } catch (e) { /* ignore */ }
            }
          });
        },
      },
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    minify: "esbuild",
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("react-simple-maps") || id.includes("d3-geo") || id.includes("topojson")) return "maps";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("lucide-react")) return "icons";
          // Keep react + react-dom + scheduler + jsx-runtime together — splitting
          // them causes "__SECRET_INTERNALS..." errors when chunks load out of order.
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("react/jsx-runtime") ||
            id.includes("react/jsx-dev-runtime")
          ) {
            return "react";
          }
          return "vendor";
        },
      },
    },
  },
});
