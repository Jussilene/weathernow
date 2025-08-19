module.exports = {
  globDirectory: "dist",
  globPatterns: [
    "**/*.{js,css,html,png,svg,ico,webmanifest}",
    "icons/*"
  ],
  swDest: "dist/sw.js",

  // SPA fallback (não intercepta /api nem /icons)
  navigateFallback: "/index.html",
  navigateFallbackDenylist: [/^\/api\//, /^\/icons\//],

  // Cache de API: funciona no proxy local (porta 4001) e no Render
  runtimeCaching: [
    {
      urlPattern: ({ url }) => {
        const isLocalPort4001 = url.port === "4001" && url.pathname.startsWith("/api/");
        const isRender = /weathernow-.*\.onrender\.com$/i.test(url.hostname) && url.pathname.startsWith("/api/");
        return isLocalPort4001 || isRender;
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 5,
        fetchOptions: { mode: "cors" }
      }
    }
  ]
};
