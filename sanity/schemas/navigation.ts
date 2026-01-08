import { defineType, defineField } from 'sanity'

export const navigation = defineType({
    name: 'navigation',
    title: 'Navigation',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Navigation Title',
            type: 'string',
            description: 'Internal name for this navigation menu',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'Use "main-nav" for header, "footer-nav" for footer sections',
            options: {
                source: 'title',
            },
            validation: (Rule) => Rule.required(),
        }),
        {
            name: 'items',
            title: 'Navigation Items',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'name', title: 'Link Text', type: 'string', validation: (Rule) => Rule.required() },
                        { name: 'href', title: 'URL/Path', type: 'string', validation: (Rule) => Rule.required() },
                        { name: 'external', title: 'External Link?', type: 'boolean', initialValue: false },
                    ],
                },
            ],
        },
    ],
})
