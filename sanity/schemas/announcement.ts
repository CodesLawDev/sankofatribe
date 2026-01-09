import { defineType, defineField } from 'sanity'

export const announcement = defineType({
    name: 'announcement',
    title: 'Announcement Bar',
    type: 'document',
    description: 'Configure a banner that appears at the top of your website to announce important messages, promotions, or updates. Only one active announcement displays at a time.',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Announcement Bar',
            hidden: true,
        }),
        defineField({
            name: 'text',
            title: 'Announcement Text',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'link',
            title: 'Link (optional)',
            type: 'string',
        }),
        defineField({
            name: 'backgroundColor',
            title: 'Background Color',
            type: 'string',
            options: {
                list: [
                    { title: 'Black', value: 'black' },
                    { title: 'White', value: 'white' },
                    { title: 'Gray', value: 'gray' },
                    { title: 'Brand', value: 'brand' },
                ],
            },
            initialValue: 'black',
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
        defineField({
            name: 'isActive',
            title: 'Active',
            type: 'boolean',
            description: 'Turn on/off the announcement bar',
            initialValue: true,
        }),
    ],
})
