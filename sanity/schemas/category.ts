import { defineType, defineField } from 'sanity'

export const category = defineType({
    name: 'category',
    title: 'Category',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Category Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'image',
            title: 'Category Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        {
            name: 'parentCategory',
            title: 'Parent Category',
            type: 'reference',
            to: [{ type: 'category' }],
            description: 'Leave empty for a top-level category',
        },
        {
            name: 'subCategories',
            title: 'Sub Categories',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
            description: 'Optional curated children for navigation',
        },
    ],
})
