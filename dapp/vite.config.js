import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api/explorer proxies to the Bradbury explorer API (see netlify.toml).
// The explorer API sends no CORS headers, so the dApp must call it
// same-origin — in production the Netlify redirect does this. Locally, a
// small middleware forwards with node fetch instead.
function explorerMiddleware() {
  return async (req, res, next) => {
    if (!req.url || !req.url.startsWith("/api/explorer")) return next();
    const upstream =
      "https://scan.bradbury.genlayer.com/api/v1" + req.url.slice("/api/explorer".length);
    try {
      const r = await fetch(upstream, { headers: { accept: "application/json" } });
      const body = await r.arrayBuffer();
      res.writeHead(r.status, {
        "content-type": r.headers.get("content-type") || "application/json",
      });
      res.end(Buffer.from(body));
    } catch (e) {
      res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: String(e) }));
    }
  };
}

const explorerProxyPlugin = {
  name: "explorer-api-proxy",
  configureServer(server) {
    server.middlewares.use(explorerMiddleware());
  },
  configurePreviewServer(server) {
    server.middlewares.use(explorerMiddleware());
  },
};

export default defineConfig({
  plugins: [react(), explorerProxyPlugin],
});
