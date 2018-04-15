module.exports = {
  staticFileGlobs: [
    '/index.html',
    '/manifest.json',
    '/bower_components/webcomponentsjs/*',
    '/images/*'
  ],
  navigateFallback: '/index.html',
  navigateFallbackWhitelist: [/^(?!.*\.html$|\/files\/).*/],
  runtimeCaching: [
    {
      urlPattern: /\/files\/images\/.*/,
      handler: 'cacheFirst',
      options: {
        cache: {
          maxEntries: 200,
          name: 'items-cache'
        }
      }
    },
    {
      urlPattern: /\/files\/.*json/,
      handler: 'fastest',
      options: {
        cache: {
          maxEntries: 100,
          name: 'files-cache'
        }
      }
    }
  ]
};
