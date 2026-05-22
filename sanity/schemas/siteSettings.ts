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
        defineField({
            name: 'activePaymentGateway',
            title: 'Active Payment Gateway',
            type: 'string',
            description: 'Select which payment gateway(s) should be available at checkout',
            options: {
                list: [
                    { title: 'Hubtel Only', value: 'hubtel' },
                    { title: 'Paystack Only', value: 'paystack' },
                    { title: 'Both (User Choice)', value: 'both' },
                ],
            },
            initialValue: 'both',
            validation: (Rule) => Rule.required(),
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
            name: 'adminPhone',
            title: 'Admin Phone (SMS)',
            type: 'string',
            description: 'Used for order alerts via SMS',
        }),
        defineField({
            name: 'whatsappNumber',
            title: 'WhatsApp Number',
            type: 'string',
            description: 'Public WhatsApp number for customer support chat button (e.g. 233541234567)',
        }),
        defineField({
            name: 'senderId',
            title: 'SMS Sender ID',
            type: 'string',
            description: 'Displayed sender ID for CodeslawBMS SMS',
        }),
        defineField({
            name: 'currency',
            title: 'Currency Settings',
            type: 'object',
            fields: [
                defineField({
                    name: 'defaultCurrency',
                    title: 'Default Currency',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Ghana Cedis (GHS)', value: 'GHS' },
                            { title: 'US Dollar (USD)', value: 'USD' },
                        ],
                    },
                    initialValue: 'GHS',
                    description: 'Currency for users in Ghana',
                }),
                defineField({
                    name: 'exchangeRate',
                    title: 'GHS to USD Exchange Rate',
                    type: 'number',
                    description: 'e.g., 1 GHS = 0.082 USD',
                    validation: (Rule) => Rule.required().positive(),
                    initialValue: 0.082,
                }),
                defineField({
                    name: 'lastUpdated',
                    title: 'Last Updated',
                    type: 'datetime',
                    readOnly: true,
                }),
            ],
        } as any),
        defineField({
            name: 'geoLocation',
            title: 'Geo Location Settings',
            type: 'object',
            fields: [
                defineField({
                    name: 'ghanaCurrencyCountries',
                    title: 'Countries Using GHS',
                    type: 'array',
                    of: [{ type: 'string' }],
                    initialValue: ['GH'],
                    description: 'ISO country codes for GHS currency (e.g., GH for Ghana)',
                }),
                defineField({
                    name: 'defaultCountry',
                    title: 'Default Country Code',
                    type: 'string',
                    initialValue: 'GH',
                    description: 'ISO country code when geolocation cannot be determined',
                }),
            ],
        } as any),
    ],
})
