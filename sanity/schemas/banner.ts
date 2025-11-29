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
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'ctaText',
            title: 'CTA Button Text',
            type: 'string',
        }),
        defineField({
            name: 'ctaLink',
            title: 'CTA Link',
            type: 'string',
        }),
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
