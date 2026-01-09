import { defineType, defineField } from 'sanity'

export const homePage = defineType({
    name: 'homePage',
    title: 'Home Page',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Page Title',
            type: 'string',
            initialValue: 'Home Page',
        }),
        {
            name: 'heroBanners',
            title: 'Hero Banners',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'banner' }] }],
            validation: (Rule: any) => Rule.min(1).max(5),
        },
        {
            name: 'featuredProducts',
            title: 'Featured Products',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'product' }] }],
        },
        {
            name: 'featuredCategories',
            title: 'Featured Categories',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
        },
        {
            name: 'collectionHeading',
            title: 'Latest Collections Heading',
            type: 'string',
            initialValue: 'Latest Collections',
        },
        {
            name: 'collectionSubheading',
            title: 'Latest Collections Subheading',
            type: 'text',
            rows: 2,
            initialValue: 'Discover our carefully curated selection of premium products',
        },
        {
            name: 'latestCollectionProducts',
            title: 'Latest Collection Products',
            type: 'array',
            description: 'Select specific products to feature; falls back to newest products automatically',
            of: [{ type: 'reference', to: [{ type: 'product' }] }],
        },
        // Curated banner sections that can render 2-up or 3-up cards
        {
            name: 'bannerSections',
            title: 'Curated Banner Sections',
            type: 'array',
            description: 'Add sections of 2 or 3 banner cards side-by-side',
            of: [
                {
                    type: 'object',
                    name: 'bannerSection',
                    title: 'Banner Section',
                    fields: [
                        { name: 'title', title: 'Section Title', type: 'string' },
                        {
                            name: 'layout',
                            title: 'Layout',
                            type: 'string',
                            options: { list: [
                                { title: 'Two cards (2-up)', value: 'two' },
                                { title: 'Three cards (3-up)', value: 'three' },
                            ] },
                        },
                        {
                            name: 'banners',
                            title: 'Banners',
                            type: 'array',
                            of: [{ type: 'reference', to: [{ type: 'banner' }] }],
                            description: 'Pick 2 banners for 2-up, or 3 banners for 3-up layout',
                        },
                    ],
                },
            ],
        },
    ],
})
