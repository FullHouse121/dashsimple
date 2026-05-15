import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://dashsimple.onrender.com",
        changeOrigin: true,
        secure: true,
        ws: false,
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            const code = err?.code || "ERR";
            // eslint-disable-next-line no-console
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
