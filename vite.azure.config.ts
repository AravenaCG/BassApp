import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vinext from "vinext";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/postcss";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vinext(), nitro()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    // Azure App Service does not provide Cloudflare Workers bindings. The
    // shim keeps the route buildable and makes progress fail closed until D1
    // is migrated to an Azure database.
    alias: {
      "cloudflare:workers": path.join(projectRoot, "lib/azure-cloudflare-workers-shim.ts"),
    },
  },
});
