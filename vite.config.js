import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// flag-icons ships every country twice: a 4x3 rule (.fi-br) and a 1x1 square
// rule (.fi-br.fis). CountryFlag only ever emits "fi fi-xx", so the 271 square
// flags were bundled, base64-inlined into the render-blocking stylesheet, and
// never shown. Stripping them here keeps full country coverage — no allow-list
// to fall out of date when traffic arrives from a new geo.
const dropSquareFlags = {
  name: "flag-icons-drop-1x1",
  enforce: "pre",
  transform(code, id) {
    if (!id.includes("flag-icons") || !id.endsWith(".css")) return null;
    return { code: code.replace(/\.fi-[a-z0-9-]+\.fis\{[^}]*\}/g, ""), map: null };
  },
};

// The dev UI talks to the deployed API by default, so a plain `npm run dev`
// shows live data. Point it at a local server to exercise server changes
// before they ship:  VITE_API_TARGET=http://localhost:5174 npm run dev:client
// (log in again — a local API signs tokens with the local AUTH_SECRET).
const API_TARGET = process.env.VITE_API_TARGET || "https://dashsimple.onrender.com";

// Shared by dev and preview. `npm run preview` serves the real production
// bundle, which is the only way to check what Netlify will ship — but it read
// no proxy config, so every /api call 404'd and the build looked broken when
// it was not.
const apiProxy = {
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
};

export default defineConfig({
  plugins: [dropSquareFlags, react()],
  server: { port: 5173, proxy: apiProxy },
  preview: { port: 4173, proxy: apiProxy },
  build: {
    target: "es2020",
    // Default behaviour inlines anything under 4 kB as a data: URI, which put
    // most of the flag set inside vendor.css — every visitor downloaded all of
    // it before first paint. As files, the browser fetches only the flags a
    // view actually renders.
    assetsInlineLimit: (filePath) => (/[\\/]flags[\\/]/.test(filePath) ? false : undefined),
    cssCodeSplit: true,
    minify: "esbuild",
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
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
