import { defineType, defineField } from 'sanity'

export const newsletterSubscriber = defineType({
    name: 'newsletterSubscriber',
    title: 'Newsletter Subscribers',
    type: 'document',
    description: 'Manage email newsletter subscribers synced from Mailchimp',
    fields: [
        defineField({
            name: 'email',
            title: 'Email Address',
            type: 'string',
            validation: (Rule) => Rule.required().email(),
            readOnly: true,
        }),
        defineField({
            name: 'firstName',
            title: 'First Name',
            type: 'string',
        }),
        defineField({
            name: 'lastName',
            title: 'Last Name',
            type: 'string',
        }),
        defineField({
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
        }),
        defineField({
            name: 'status',
            title: 'Subscription Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Active', value: 'active' },
                    { title: 'Unsubscribed', value: 'unsubscribed' },
                    { title: 'Bounced', value: 'bounced' },
                    { title: 'Invalid', value: 'invalid' },
                ],
            },
            initialValue: 'active',
            readOnly: true,
        }),
        defineField({
            name: 'mailchimpId',
            title: 'Mailchimp ID',
            type: 'string',
            readOnly: true,
            hidden: true,
        }),
        defineField({
            name: 'mailchimpListId',
            title: 'Mailchimp List ID',
            type: 'string',
            readOnly: true,
            hidden: true,
        }),
        defineField({
            name: 'preferences',
            title: 'Email Preferences',
            type: 'string',
            description: 'JSON field for email preferences (productUpdates, offers, smsOptIn)',
            readOnly: true,
        }),
        defineField({
            name: 'tags',
            title: 'Tags',
            type: 'string',
            description: 'Comma-separated Mailchimp tags for segmentation (read-only)',
            readOnly: true,
        }),
        defineField({
            name: 'source',
            title: 'Subscription Source',
            type: 'string',
            options: {
                list: [
                    { title: 'Footer', value: 'footer' },
                    { title: 'Checkout', value: 'checkout' },
                    { title: 'Registration', value: 'registration' },
                    { title: 'Campaign', value: 'campaign' },
                    { title: 'Mailchimp', value: 'mailchimp' },
                ],
            },
            readOnly: true,
        }),
        defineField({
            name: 'subscribedAt',
            title: 'Subscribed Date',
            type: 'datetime',
            readOnly: true,
        }),
        defineField({
            name: 'confirmedAt',
            title: 'Confirmed Date',
            type: 'datetime',
            readOnly: true,
        }),
        defineField({
            name: 'unsubscribedAt',
            title: 'Unsubscribed Date',
            type: 'datetime',
            readOnly: true,
        }),
    ],
    preview: {
        select: {
            title: 'email',
            subtitle: 'status',
            name: 'firstName',
        },
        prepare({ title, subtitle, name }) {
            return {
                title,
                subtitle: `${subtitle} • ${name || 'No name'}`,
            }
        },
    },
})
