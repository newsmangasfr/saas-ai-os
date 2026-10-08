import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactive le cache Next pour que l'utilisateur voie TOUJOURS la dernière version après déploiement
  cacheComponents: false,
  // Headers HTTP : empêcher le navigateur de cacher le HTML/JS, pour qu'un Ctrl+F5 suffise
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
