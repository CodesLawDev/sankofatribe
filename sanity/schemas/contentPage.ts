import { defineType, defineField } from 'sanity'

export const contentPage = defineType({
    name: 'contentPage',
    title: 'Content Pages',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Page Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'Use: about, contact, faq, shipping, returns',
            options: {
                source: 'title',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'metaDescription',
            title: 'Meta Description',
            type: 'text',
            description: 'SEO description',
        }),
        {
            name: 'hero',
            title: 'Hero Section',
            type: 'object',
            fields: [
                { name: 'title', title: 'Hero Title', type: 'string' },
                { name: 'subtitle', title: 'Hero Subtitle', type: 'text' },
                { name: 'image', title: 'Hero Image', type: 'image' },
                { name: 'showHero', title: 'Show Hero Section', type: 'boolean', initialValue: true },
            ],
        },
        {
            name: 'content',
            title: 'Page Content',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H1', value: 'h1' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                        { title: 'H4', value: 'h4' },
                        { title: 'Quote', value: 'blockquote' },
                    ],
                },
                {
                    type: 'image',
                    fields: [
                        {
                            name: 'alt',
                            title: 'Alternative Text',
                            type: 'string',
                        },
                    ],
                },
            ],
        },
        {
            name: 'sections',
            title: 'Content Sections',
            type: 'array',
            description: 'For structured content like FAQ, features, or info boxes',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'heading', title: 'Section Heading', type: 'string' },
                        {
                            name: 'items',
                            title: 'Items',
                            type: 'array',
                            of: [
                                {
                                    type: 'object',
                                    fields: [
                                        { name: 'title', title: 'Item Title', type: 'string' },
                                        { name: 'content', title: 'Item Content', type: 'text' },
                                        { name: 'icon', title: 'Icon Name (optional)', type: 'string' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            name: 'contactInfo',
            title: 'Contact Information (for contact page)',
            type: 'object',
            fields: [
                { name: 'address', title: 'Address', type: 'text' },
                { name: 'email', title: 'Email', type: 'string' },
                { name: 'phone', title: 'Phone', type: 'string' },
                { name: 'hours', title: 'Business Hours', type: 'text' },
            ],
        },
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'slug.current',
        },
    },
})
