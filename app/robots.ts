import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/studio/',
                '/api/',
                '/account/',
                '/cart/',
                '/checkout/',
                '/login/',
                '/register/',
                '/verify/',
                '/wishlist/',
            ],
        },
        sitemap: 'https://sankofatribe.com/sitemap.xml',
    }
}
