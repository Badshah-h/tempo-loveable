import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { tempo } from "tempo-devtools/dist/vite";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          "*": "",
        },
        headers: {
          "X-Forwarded-Host": "localhost:8080",
          "X-Forwarded-Proto": "http",
        },
        onError: (err, req, res) => {
          console.warn("API proxy error:", err);
          res.writeHead(500, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              error: "Backend connection failed",
              message: "Could not connect to the API server",
              details: err.message,
            }),
          );
        },
      },
      "/api-tester": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          "*": "",
        },
        headers: {
          "X-Forwarded-Host": "localhost:8080",
          "X-Forwarded-Proto": "http",
        },
        onError: (err, req, res) => {
          console.warn("API tester proxy error:", err);
          res.writeHead(500, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              error: "Backend connection failed",
              message: "Could not connect to the API server",
              details: err.message,
            }),
          );
        },
      },
      "/sanctum": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          "*": "",
        },
        headers: {
          "X-Forwarded-Host": "localhost:8080",
          "X-Forwarded-Proto": "http",
        },
      },
    },
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    tempo(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
