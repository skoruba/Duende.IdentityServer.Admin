import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import child_process from "child_process";
import { env } from "process";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const baseFolder =
  env.APPDATA !== undefined && env.APPDATA !== ""
    ? `${env.APPDATA}/ASP.NET/https`
    : `${env.HOME}/.aspnet/https`;

const certificateName = "Skoruba.Duende.IdentityServer.Admin.UI.Client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(baseFolder)) {
  fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
  if (
    0 !==
    child_process.spawnSync(
      "dotnet",
      [
        "dev-certs",
        "https",
        "--export-path",
        certFilePath,
        "--format",
        "Pem",
        "--no-password",
      ],
      { stdio: "inherit" }
    ).status
  ) {
    throw new Error("Could not create certificate.");
  }
}

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
  ? env.ASPNETCORE_URLS.split(";")[0]
  : "https://localhost:7127";

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'table-vendor': ['@tanstack/react-table'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'utils': ['lodash', 'date-fns', 'uuid', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1200, // Increased limit for main chunk with all routes
  },
  server: {
    proxy: {
      "^/user$": {
        target,
        secure: false,
      },
      "/account/login": {
        target,
        secure: false,
      },
      "/account/logout": {
        target,
        secure: false,
      },
      "/csrf/gettoken": {
        target,
        secure: false,
      },
      "/identity-server-admin-api": {
        target,
        secure: false,
      },
      "/signin-oidc": {
        target,
        secure: false,
      },
      "/signout-callback-oidc": {
        target,
        secure: false,
      },
      "/signout-oidc": {
        target,
        secure: false,
      },
    },
    port: parseInt(env.DEV_SERVER_PORT || "50445"),
    https: {
      key: fs.readFileSync(keyFilePath),
      cert: fs.readFileSync(certFilePath),
    },
  },
});
