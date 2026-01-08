/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
            },
        },
        {
            urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'sanity-images',
                expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                },
            },
        },
        {
            urlPattern: /^https:\/\/api\.paystack\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'paystack-api',
                networkTimeoutSeconds: 10,
            },
        },
    ],
})

const nextConfig = {
    images: {
        domains: ['cdn.sanity.io'],
    },
    compiler: {
        styledComponents: true,
    },
}

module.exports = withPWA(nextConfig)
