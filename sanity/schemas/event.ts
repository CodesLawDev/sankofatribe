import { defineField, defineType } from 'sanity'

export const event = defineType({
    name: 'event',
    title: 'Event',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Event Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { 
                source: 'title', 
                maxLength: 96 
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Event Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'summary',
            title: 'Short Summary',
            type: 'text',
            description: 'Brief description for event listing and social media previews',
            validation: (Rule) => Rule.required().max(200),
        }),
        {
            name: 'description',
            title: 'Event Description',
            type: 'array',
            of: [{ type: 'block' }],
            description: 'Full event details',
        },
        defineField({
            name: 'eventDate',
            title: 'Event Date',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'endDate',
            title: 'End Date (Optional)',
            type: 'datetime',
            description: 'For multi-day events',
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'object',
            fields: [
                defineField({
                    name: 'venue',
                    title: 'Venue Name',
                    type: 'string',
                }),
                defineField({
                    name: 'address',
                    title: 'Address',
                    type: 'text',
                }),
                defineField({
                    name: 'city',
                    title: 'City',
                    type: 'string',
                }),
                defineField({
                    name: 'isVirtual',
                    title: 'Virtual Event',
                    type: 'boolean',
                    initialValue: false,
                }),
                defineField({
                    name: 'virtualLink',
                    title: 'Virtual Event Link',
                    type: 'url',
                    hidden: ({ parent }) => !parent?.isVirtual,
                }),
            ],
        } as any),
        defineField({
            name: 'category',
            title: 'Event Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Fashion Show', value: 'fashion-show' },
                    { title: 'Pop-up Store', value: 'popup' },
                    { title: 'Workshop', value: 'workshop' },
                    { title: 'Launch Event', value: 'launch' },
                    { title: 'Sale Event', value: 'sale' },
                    { title: 'Community Event', value: 'community' },
                    { title: 'Other', value: 'other' },
                ],
            },
        }),
        defineField({
            name: 'ticketInfo',
            title: 'Ticket Information',
            type: 'object',
            fields: [
                defineField({
                    name: 'isFree',
                    title: 'Free Event',
                    type: 'boolean',
                    initialValue: true,
                }),
                defineField({
                    name: 'price',
                    title: 'Ticket Price',
                    type: 'number',
                    hidden: ({ parent }) => parent?.isFree,
                }),
                defineField({
                    name: 'currency',
                    title: 'Currency',
                    type: 'string',
                    initialValue: 'GHS',
                    hidden: ({ parent }) => parent?.isFree,
                }),
                defineField({
                    name: 'ticketUrl',
                    title: 'Ticket Purchase URL',
                    type: 'url',
                    hidden: ({ parent }) => parent?.isFree,
                }),
            ],
        } as any),
        defineField({
            name: 'registrationUrl',
            title: 'Registration/RSVP URL',
            type: 'url',
            description: 'Link for event registration or RSVP',
        }),
        defineField({
            name: 'status',
            title: 'Event Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Upcoming', value: 'upcoming' },
                    { title: 'Ongoing', value: 'ongoing' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Cancelled', value: 'cancelled' },
                ],
            },
            initialValue: 'upcoming',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'featured',
            title: 'Featured Event',
            type: 'boolean',
            initialValue: false,
            description: 'Show this event prominently on the events page',
        }),
        {
            name: 'gallery',
            title: 'Event Gallery',
            type: 'array',
            of: [{ type: 'image' }],
            description: 'Additional event photos',
        },
        defineField({
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'image',
            date: 'eventDate',
            status: 'status',
        },
        prepare({ title, media, date, status }) {
            const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'
            return {
                title: title,
                subtitle: `${formattedDate} • ${status}`,
                media: media,
            }
        },
    },
})
