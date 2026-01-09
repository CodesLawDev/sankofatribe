import { defineType, defineField } from 'sanity'

export const customer = defineType({
    name: 'customer',
    title: 'Customers',
    type: 'document',
    fields: [
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.required().email(),
            readOnly: true,
        }),
        defineField({
            name: 'firstName',
            title: 'First Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'lastName',
            title: 'Last Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
        }),
        defineField({
            name: 'profileImage',
            title: 'Profile Image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'registeredAt',
            title: 'Registration Date',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
            readOnly: true,
        }),
        defineField({
            name: 'lastLogin',
            title: 'Last Login',
            type: 'datetime',
            readOnly: true,
        }),
        defineField({
            name: 'status',
            title: 'Account Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Active', value: 'active' },
                    { title: 'Inactive', value: 'inactive' },
                    { title: 'Suspended', value: 'suspended' },
                    { title: 'Deleted', value: 'deleted' },
                ],
            },
            initialValue: 'active',
        }),
        // Shipping addresses
        {
            name: 'shippingAddresses',
            title: 'Shipping Addresses',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'address',
                    title: 'Address',
                    fields: [
                        { name: 'id', type: 'string', title: 'Address ID', hidden: true },
                        { name: 'label', type: 'string', title: 'Label', description: 'e.g., Home, Work' },
                        { name: 'street', type: 'string', title: 'Street Address' },
                        { name: 'city', type: 'string', title: 'City' },
                        { name: 'region', type: 'string', title: 'Region/State' },
                        { name: 'postalCode', type: 'string', title: 'Postal Code' },
                        { name: 'country', type: 'string', title: 'Country' },
                        { name: 'isDefault', type: 'boolean', title: 'Default Address', initialValue: false },
                    ],
                },
            ],
        },
        // Order history reference
        {
            name: 'orders',
            title: 'Orders',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'order' }] }],
            readOnly: true,
        },
        defineField({
            name: 'totalOrders',
            title: 'Total Orders',
            type: 'number',
            initialValue: 0,
            readOnly: true,
        }),
        defineField({
            name: 'totalSpent',
            title: 'Total Spent (₵)',
            type: 'number',
            initialValue: 0,
            readOnly: true,
        }),
        defineField({
            name: 'loyaltyPoints',
            title: 'Loyalty Points',
            type: 'number',
            description: 'Earned points for rewards program',
            initialValue: 0,
        }),
        defineField({
            name: 'preferences',
            title: 'Communication Preferences',
            type: 'object',
            fields: [
                defineField({ name: 'emailMarketing', type: 'boolean', title: 'Receive Marketing Emails', initialValue: true }),
                defineField({ name: 'smsNotifications', type: 'boolean', title: 'Receive SMS Notifications', initialValue: false }),
                defineField({ name: 'orderUpdates', type: 'boolean', title: 'Order Updates', initialValue: true }),
            ],
        } as any),
        defineField({
            name: 'notes',
            title: 'Internal Notes',
            type: 'text',
            options: {
                rows: 3,
            },
            description: 'Internal notes for staff use only',
        }),
    ],
    preview: {
        select: {
            title: 'email',
            subtitle: 'firstName',
            media: 'profileImage',
            status: 'status',
            totalOrders: 'totalOrders',
        },
        prepare({ title, subtitle, media, status, totalOrders }) {
            return {
                title,
                subtitle: `${subtitle || 'Customer'} • ${totalOrders || 0} orders • ${status}`,
                media,
            }
        },
    },
})
