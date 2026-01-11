import { defineType, defineField } from 'sanity'

export const aboutPage = defineType({
    name: 'aboutPage',
    title: 'About Page',
    type: 'document',
    description: 'Manage the about page content',
    fields: [
        defineField({
            name: 'title',
            title: 'Page Title',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle',
            type: 'string',
            description: 'Short subtitle under the main title',
        }),
        defineField({
            name: 'description',
            title: 'Meta Description',
            type: 'string',
            description: 'SEO description (160 characters)',
            validation: (Rule: any) => Rule.max(160),
        }),
        defineField({
            name: 'heroImage',
            title: 'Hero Image',
            type: 'image',
            description: 'Large hero image for the about page',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'heroTitle',
            title: 'Hero Title',
            type: 'string',
            description: 'Main heading text overlaid on hero image',
        }),
        defineField({
            name: 'heroDescription',
            title: 'Hero Description',
            type: 'text',
            description: 'Subheading text on hero image',
            options: {
                rows: 3,
            },
        }),
        {
            name: 'founderStory',
            title: 'Founder Story',
            type: 'object',
            options: {
                collapsible: true,
            },
            fields: [
                {
                    name: 'founderName',
                    title: 'Founder Name',
                    type: 'string',
                },
                {
                    name: 'founderRole',
                    title: 'Founder Role',
                    type: 'string',
                    initialValue: 'Founder & Creative Director',
                },
                {
                    name: 'founderImage',
                    title: 'Founder Image',
                    type: 'image',
                    options: {
                        hotspot: true,
                    },
                },
                {
                    name: 'founderBio',
                    title: 'Founder Bio/Story',
                    type: 'text',
                    options: {
                        rows: 8,
                    },
                },
                {
                    name: 'quote',
                    title: 'Founder Quote',
                    type: 'string',
                    description: 'Inspiring quote from the founder',
                },
            ],
        },
        {
            name: 'heritageSection',
            title: 'Heritage & History',
            type: 'object',
            options: {
                collapsible: true,
            },
            fields: [
                {
                    name: 'title',
                    title: 'Heritage Title',
                    type: 'string',
                    initialValue: 'Our Heritage',
                },
                {
                    name: 'content',
                    title: 'Heritage Story',
                    type: 'text',
                    options: {
                        rows: 6,
                    },
                },
                {
                    name: 'image',
                    title: 'Heritage Image',
                    type: 'image',
                    options: {
                        hotspot: true,
                    },
                },
            ],
        },
        {
            name: 'missionSection',
            title: 'Mission Section',
            type: 'object',
            options: {
                collapsible: true,
            },
            fields: [
                {
                    name: 'title',
                    title: 'Mission Title',
                    type: 'string',
                    initialValue: 'Our Mission',
                },
                {
                    name: 'content',
                    title: 'Mission Description',
                    type: 'text',
                    options: {
                        rows: 5,
                    },
                },
                {
                    name: 'image',
                    title: 'Mission Image',
                    type: 'image',
                    options: {
                        hotspot: true,
                    },
                },
            ],
        },
        {
            name: 'visionSection',
            title: 'Vision Section',
            type: 'object',
            options: {
                collapsible: true,
            },
            fields: [
                {
                    name: 'title',
                    title: 'Vision Title',
                    type: 'string',
                    initialValue: 'Our Vision',
                },
                {
                    name: 'content',
                    title: 'Vision Description',
                    type: 'text',
                    options: {
                        rows: 5,
                    },
                },
                {
                    name: 'image',
                    title: 'Vision Image',
                    type: 'image',
                    options: {
                        hotspot: true,
                    },
                },
            ],
        },
        {
            name: 'values',
            title: 'Core Values',
            type: 'array',
            of: [
                {
                    type: 'object',
                    title: 'Value',
                    fields: [
                        {
                            name: 'icon',
                            title: 'Icon (Emoji)',
                            type: 'string',
                            description: 'Use an emoji to represent this value',
                        },
                        {
                            name: 'title',
                            title: 'Value Title',
                            type: 'string',
                        },
                        {
                            name: 'description',
                            title: 'Value Description',
                            type: 'text',
                            options: {
                                rows: 3,
                            },
                        },
                    ],
                    preview: {
                        select: {
                            title: 'title',
                            icon: 'icon',
                        },
                        prepare({ title, icon }: any) {
                            return {
                                title: title,
                                subtitle: icon || '✓',
                            }
                        },
                    },
                },
            ],
        },
        {
            name: 'teamMembers',
            title: 'Team Members',
            type: 'array',
            of: [
                {
                    type: 'object',
                    title: 'Team Member',
                    fields: [
                        {
                            name: 'name',
                            title: 'Name',
                            type: 'string',
                        },
                        {
                            name: 'role',
                            title: 'Role/Position',
                            type: 'string',
                        },
                        {
                            name: 'bio',
                            title: 'Bio',
                            type: 'text',
                            options: {
                                rows: 4,
                            },
                        },
                        {
                            name: 'image',
                            title: 'Profile Image',
                            type: 'image',
                            options: {
                                hotspot: true,
                            },
                        },
                        {
                            name: 'email',
                            title: 'Email',
                            type: 'string',
                        },
                        {
                            name: 'socials',
                            title: 'Social Links',
                            type: 'object',
                            fields: [
                                {
                                    name: 'twitter',
                                    title: 'Twitter URL',
                                    type: 'url',
                                },
                                {
                                    name: 'linkedin',
                                    title: 'LinkedIn URL',
                                    type: 'url',
                                },
                                {
                                    name: 'instagram',
                                    title: 'Instagram URL',
                                    type: 'url',
                                },
                            ],
                        },
                    ],
                    preview: {
                        select: {
                            title: 'name',
                            subtitle: 'role',
                            media: 'image',
                        },
                    },
                },
            ],
        },
        {
            name: 'ctaSection',
            title: 'CTA Section',
            type: 'object',
            options: {
                collapsible: true,
            },
            fields: [
                {
                    name: 'title',
                    title: 'CTA Title',
                    type: 'string',
                    initialValue: 'Join Our Community',
                },
                {
                    name: 'description',
                    title: 'CTA Description',
                    type: 'text',
                    options: {
                        rows: 3,
                    },
                },
                {
                    name: 'buttonText',
                    title: 'Button Text',
                    type: 'string',
                    initialValue: 'Shop Now',
                },
                {
                    name: 'buttonLink',
                    title: 'Button Link',
                    type: 'string',
                    initialValue: '/products',
                },
            ],
        },
        defineField({
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
            readOnly: true,
        }),
        defineField({
            name: 'updatedAt',
            title: 'Updated At',
            type: 'datetime',
            readOnly: true,
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }: any) {
            return {
                title: title || 'About Page',
            }
        },
    },
})
