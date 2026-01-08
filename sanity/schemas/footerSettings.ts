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
                                        { name: 'url', title: 'URL', type: 'string' },
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
