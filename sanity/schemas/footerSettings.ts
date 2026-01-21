import { defineType, defineField } from 'sanity'

export const footerSettings = defineType({
    name: 'footerSettings',
    title: 'Footer Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Footer Settings',
            hidden: true,
        }),
        defineField({
            name: 'showSections',
            title: 'Show Sections',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'showSocialLinks',
            title: 'Show Social Links',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'showNewsletter',
            title: 'Show Newsletter',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'showBottomSection',
            title: 'Show Bottom Section',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'showLegalLinks',
            title: 'Show Legal Links',
            type: 'boolean',
            initialValue: true,
        }),
        {
            name: 'sections',
            title: 'Footer Sections',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'heading', title: 'Section Heading', type: 'string', validation: (Rule) => Rule.required() },
                        {
                            name: 'links',
                            title: 'Links',
                            type: 'array',
                            of: [
                                {
                                    type: 'object',
                                    fields: [
                                        { name: 'text', title: 'Link Text', type: 'string' },
                                        {
                                            name: 'url',
                                            title: 'Destination',
                                            type: 'string',
                                            description: 'Select a known route or add a custom URL.',
                                            options: {
                                                list: [
                                                    { title: 'Home', value: '/' },
                                                    { title: 'All Products', value: '/products' },
                                                    { title: 'New Releases', value: '/products?filter=new' },
                                                    { title: 'Bestsellers', value: '/products?filter=bestsellers' },
                                                    { title: 'On Sale', value: '/products?filter=sale' },
                                                    { title: 'Women', value: '/category/women' },
                                                    { title: 'Men', value: '/category/men' },
                                                    { title: 'Kids', value: '/products?category=kids' },
                                                    { title: 'Accessories', value: '/products?category=accessories' },
                                                    { title: 'FAQ', value: '/faq' },
                                                    { title: 'Shipping', value: '/shipping' },
                                                    { title: 'Returns', value: '/returns' },
                                                    { title: 'Contact', value: '/contact' },
                                                    { title: 'Privacy Policy', value: '/privacy' },
                                                    { title: 'Terms of Service', value: '/terms' },
                                                ],
                                                layout: 'dropdown',
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            name: 'socialLinks',
            title: 'Social Media Links',
            type: 'object',
            fields: [
                { name: 'instagram', title: 'Instagram URL', type: 'url' },
                { name: 'facebook', title: 'Facebook URL', type: 'url' },
                { name: 'twitter', title: 'Twitter URL', type: 'url' },
                { name: 'youtube', title: 'YouTube URL', type: 'url' },
            ],
        },
        {
            name: 'newsletter',
            title: 'Newsletter Section',
            type: 'object',
            fields: [
                { name: 'heading', title: 'Heading', type: 'string' },
                { name: 'description', title: 'Description', type: 'text' },
                { name: 'buttonText', title: 'Button Text', type: 'string' },
            ],
        },
        {
            name: 'bottomSection',
            title: 'Bottom Section',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'title', title: 'Title', type: 'string' },
                        { name: 'description', title: 'Description', type: 'text' },
                    ],
                },
            ],
        },
        defineField({
            name: 'copyrightText',
            title: 'Copyright Text',
            type: 'string',
            description: 'Use {year} for current year',
        }),
        {
            name: 'legalLinks',
            title: 'Legal Links',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'text', title: 'Text', type: 'string' },
                        { name: 'url', title: 'URL', type: 'string' },
                    ],
                },
            ],
        },
    ],
})
