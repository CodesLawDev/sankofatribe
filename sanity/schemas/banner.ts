import { defineType, defineField } from 'sanity'

export const banner = defineType({
    name: 'banner',
    title: 'Banner',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Banner Title',
            type: 'string',
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle',
            type: 'string',
        }),
        defineField({
            name: 'image',
            title: 'Banner Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            description: 'Use image for static banners',
        }),
        defineField({
            name: 'videoUrl',
            title: 'Video URL',
            type: 'url',
            description: 'Optional: Add a video URL (YouTube, Vimeo, or direct .mp4 link). Video will be used instead of image if provided.',
        }),
        defineField({
            name: 'ctaText',
            title: 'Primary CTA Text',
            type: 'string',
        }),
        defineField({
            name: 'ctaLinkSelect',
            title: 'Primary CTA Link (Select)',
            type: 'string',
            description: 'Choose a link destination without typing URLs',
            options: {
                list: [
                    { title: 'Homepage', value: 'home' },
                    { title: 'All Products', value: 'products' },
                    { title: 'Products: Men', value: 'products-men' },
                    { title: 'Products: Women', value: 'products-women' },
                    { title: 'Products: Kids', value: 'products-kids' },
                    { title: 'Wishlist', value: 'wishlist' },
                    { title: 'Cart', value: 'cart' },
                    { title: 'Account', value: 'account' },
                    { title: 'Contact', value: 'contact' },
                    { title: 'FAQ', value: 'faq' },
                ],
            },
        }),
        defineField({
            name: 'ctaLink',
            title: 'Primary CTA Link',
            type: 'string',
            description: 'Optional custom URL if not using the dropdown',
        }),
        {
            name: 'ctaCategory',
            title: 'Primary CTA Category',
            type: 'reference',
            to: [{ type: 'category' }],
            description: 'Alternatively link to a specific category',
        },
        {
            name: 'ctaProduct',
            title: 'Primary CTA Product',
            type: 'reference',
            to: [{ type: 'product' }],
            description: 'Alternatively link to a specific product',
        },
        defineField({
            name: 'ctaTextSecondary',
            title: 'Secondary CTA Text',
            type: 'string',
            description: 'Optional second button shown beside the primary CTA',
        }),
        defineField({
            name: 'ctaLinkSecondarySelect',
            title: 'Secondary CTA Link (Select)',
            type: 'string',
            description: 'Choose a link destination without typing URLs',
            options: {
                list: [
                    { title: 'Homepage', value: 'home' },
                    { title: 'All Products', value: 'products' },
                    { title: 'Products: Men', value: 'products-men' },
                    { title: 'Products: Women', value: 'products-women' },
                    { title: 'Products: Kids', value: 'products-kids' },
                    { title: 'Wishlist', value: 'wishlist' },
                    { title: 'Cart', value: 'cart' },
                    { title: 'Account', value: 'account' },
                    { title: 'Contact', value: 'contact' },
                    { title: 'FAQ', value: 'faq' },
                ],
            },
        }),
        defineField({
            name: 'ctaLinkSecondary',
            title: 'Secondary CTA Link',
            type: 'string',
            description: 'Optional custom URL if not using the dropdown',
        }),
        {
            name: 'ctaCategorySecondary',
            title: 'Secondary CTA Category',
            type: 'reference',
            to: [{ type: 'category' }],
            description: 'Alternatively link to a specific category',
        },
        {
            name: 'ctaProductSecondary',
            title: 'Secondary CTA Product',
            type: 'reference',
            to: [{ type: 'product' }],
            description: 'Alternatively link to a specific product',
        },
        defineField({
            name: 'textColor',
            title: 'Text Color',
            type: 'string',
            options: {
                list: [
                    { title: 'White', value: 'white' },
                    { title: 'Black', value: 'black' },
                ],
            },
            initialValue: 'white',
        }),
    ],
})
