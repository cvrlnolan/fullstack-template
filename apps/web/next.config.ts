import type { NextConfig } from "next";

// Server-side URL of the Python API. Inside docker-compose this is the service name.
const API_URL = process.env.API_URL ?? "http://localhost:8000";

const config: NextConfig = {
  output: "standalone",
  // Proxy /api/* to the Python API so the browser stays same-origin (no CORS needed).
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default config;
