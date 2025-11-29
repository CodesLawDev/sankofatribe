import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'siteName',
            title: 'Site Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'logo',
            title: 'Logo',
            type: 'image',
        }),
        defineField({
            name: 'description',
            title: 'Site Description',
            type: 'text',
            description: 'Used for SEO',
        }),
        {
            name: 'mainNavigation',
            title: 'Main Navigation',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'title', title: 'Title', type: 'string' },
                        { name: 'link', title: 'Link', type: 'string' },
                    ],
                },
            ],
        },
        defineField({
            name: 'footerText',
            title: 'Footer Text',
            type: 'text',
        }),
        {
            name: 'socialLinks',
            title: 'Social Media Links',
            type: 'object',
            fields: [
                { name: 'instagram', title: 'Instagram', type: 'url' },
                { name: 'facebook', title: 'Facebook', type: 'url' },
                { name: 'twitter', title: 'Twitter', type: 'url' },
            ],
        },
    ],
})
