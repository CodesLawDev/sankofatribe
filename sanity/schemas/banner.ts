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
            name: 'ctaLink',
            title: 'Primary CTA Link',
            type: 'string',
        }),
        defineField({
            name: 'ctaTextSecondary',
            title: 'Secondary CTA Text',
            type: 'string',
            description: 'Optional second button shown beside the primary CTA',
        }),
        defineField({
            name: 'ctaLinkSecondary',
            title: 'Secondary CTA Link',
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
