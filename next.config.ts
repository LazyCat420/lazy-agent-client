// ============================================================
// Prism Client — Next.js Configuration
// ============================================================
// Bootstraps secrets from Vault at startup
// and injects them into process.env for the app.
// ============================================================

import type { NextConfig } from "next";
import { bootstrapLocalEnvironment } from "./src/bootstrap.ts";

// ── Bootstrap secrets locally from projects.json ────────────────
bootstrapLocalEnvironment();

const TOOLS_SERVICE_URL =
  process.env.TOOLS_SERVICE_URL ||
  process.env.LAZY_TOOL_SERVICE_URL ||
  "http://localhost:1234";

const PRISM_CLIENT_DOMAIN = process.env.PRISM_CLIENT_DOMAIN;

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: PRISM_CLIENT_DOMAIN ? [PRISM_CLIENT_DOMAIN] : undefined,
  turbopack: {},

  // ── Temporary: ignore TS errors during build ──────────────
  // 141 files have pre-existing `unknown` type debt from the
  // ongoing strict-mode TS migration. Turbopack compiles fine;
  // only the type-check phase fails. Remove this once the
  // TS cleanup is complete.
  typescript: {
    ignoreBuildErrors: true,
  },

  transpilePackages: [
    "@rodrigo-barraza/components-library",
    "@rodrigo-barraza/utilities-library",
  ],

  // Expose resolved values to both server and client bundles.
  // config.ts applies environment-aware overrides for browser contexts
  // (e.g. public domain for prism-service, proxy path for tools-service).
  env: {
    // ── Sessions ──────────────────────────────────────────────
    SESSIONS_SERVICE_URL: process.env.SESSIONS_SERVICE_URL,
    SESSIONS_SERVICE_PUBLIC_URL: process.env.SESSIONS_SERVICE_PUBLIC_URL,
    PRISM_CLIENT_PORT: process.env.PRISM_CLIENT_PORT,
    PRISM_CLIENT_DOMAIN: PRISM_CLIENT_DOMAIN,
    PRISM_SERVICE_URL: process.env.PRISM_SERVICE_URL,
    PRISM_SERVICE_PUBLIC_URL: process.env.PRISM_SERVICE_PUBLIC_URL,
    PRISM_WS_URL: process.env.PRISM_WS_URL,
    PRISM_WS_PUBLIC_URL: process.env.PRISM_WS_PUBLIC_URL,
    TOOLS_SERVICE_URL: TOOLS_SERVICE_URL,
    MINIO_PUBLIC_URL: process.env.MINIO_PUBLIC_URL,
    PRISM_SERVICE_MINIO_BUCKET_NAME: process.env.PRISM_SERVICE_MINIO_BUCKET_NAME,
    ACCOUNTS_SERVICE_URL: process.env.ACCOUNTS_SERVICE_URL,
    CUSTOM_MODEL_NAME: process.env.CUSTOM_MODEL_NAME || "",

    // Explicit NEXT_PUBLIC_ variables for Turbopack client-side injection
    NEXT_PUBLIC_PRISM_CLIENT_DOMAIN: PRISM_CLIENT_DOMAIN,
    NEXT_PUBLIC_PRISM_SERVICE_URL: process.env.PRISM_SERVICE_URL,
    NEXT_PUBLIC_PRISM_SERVICE_PUBLIC_URL: process.env.PRISM_SERVICE_PUBLIC_URL,
    NEXT_PUBLIC_PRISM_WS_URL: process.env.PRISM_WS_URL,
    NEXT_PUBLIC_PRISM_WS_PUBLIC_URL: process.env.PRISM_WS_PUBLIC_URL,
    NEXT_PUBLIC_TOOLS_SERVICE_URL: TOOLS_SERVICE_URL,
    NEXT_PUBLIC_MINIO_PUBLIC_URL: process.env.MINIO_PUBLIC_URL,
    NEXT_PUBLIC_PRISM_SERVICE_MINIO_BUCKET_NAME:
      process.env.PRISM_SERVICE_MINIO_BUCKET_NAME,
    NEXT_PUBLIC_ACCOUNTS_SERVICE_URL: process.env.ACCOUNTS_SERVICE_URL,
    NEXT_PUBLIC_CUSTOM_MODEL_NAME: process.env.CUSTOM_MODEL_NAME || "",
  },

  // ── Rewrite Proxy ──────────────────────────────────────────
  // Tools-service is internal-only (no public hostname).
  // Proxy /api/tools/* → tools-service so the browser never makes direct
  // requests to LAN IPs. Prism-service does NOT need a rewrite — it has
  // a public domain (PRISM_SERVICE_PUBLIC_URL from vault) for production.
  async rewrites() {
    return [
      {
        source: "/api/tools/:path*",
        destination: `${TOOLS_SERVICE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
