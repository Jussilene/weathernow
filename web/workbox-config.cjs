// web/workbox-config.cjs
module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{html,js,css,png,svg,webmanifest}'],
  swDest: 'dist/sw.js',
  clientsClaim: true,
  skipWaiting: true,

  // Caches úteis para o app
  runtimeCaching: [
    // APIs do seu proxy no Render
    {
      urlPattern: /^https:\/\/weathernow-0ya4\.onrender\.com\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: { maxAgeSeconds: 60 * 60 }, // 1h
      },
    },
    // Imagens (ícones etc.)
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'images' },
    },
  ],
};
