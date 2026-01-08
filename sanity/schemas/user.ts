import { defineType, defineField } from 'sanity'

export const user = defineType({
    name: 'user',
    title: 'Users',
    type: 'document',
    fields: [
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.required().email(),
            // Allow editing email in Studio
            readOnly: false,
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
            name: 'passwordHash',
            title: 'Password Hash',
            type: 'string',
            hidden: true,
        }),
        // Optional: enter a temporary password in Studio. Not used until hashed.
        defineField({
            name: 'temporaryPassword',
            title: 'Temporary Password (Studio only)',
            type: 'string',
            description: 'Enter a temp password here. After saving, use Admin → Team → Reset Password to hash and apply as the real password.',
        }),
        defineField({
            name: 'resetToken',
            title: 'Password Reset Token',
            type: 'string',
            hidden: true,
        }),
        defineField({
            name: 'resetTokenExpiry',
            title: 'Reset Token Expiry',
            type: 'datetime',
            hidden: true,
        }),
        defineField({
            name: 'role',
            title: 'User Role',
            type: 'string',
            options: {
                list: [
                    { title: 'Admin (Owner)', value: 'admin' },
                    { title: 'User', value: 'user' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'permissions',
            title: 'Permissions',
            type: 'array',
            of: [defineField({ name: 'permission', type: 'string' })],
            options: {
                list: [
                    { title: 'View Orders', value: 'view_orders' },
                    { title: 'Manage Orders', value: 'manage_orders' },
                    { title: 'View Products', value: 'view_products' },
                    { title: 'Manage Products', value: 'manage_products' },
                    { title: 'View Customers', value: 'view_customers' },
                    { title: 'Manage Customers', value: 'manage_customers' },
                    { title: 'View Settings', value: 'view_settings' },
                    { title: 'Manage Settings', value: 'manage_settings' },
                    { title: 'View Analytics', value: 'view_analytics' },
                    { title: 'Manage Users', value: 'manage_users' },
                    { title: 'Send SMS', value: 'send_sms' },
                ],
            },
            hidden: ({ document }: { document?: { role?: string } }) => document?.role === 'admin',
            description: 'Admin users have all permissions automatically',
        } as any),
        defineField({
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
        }),
        defineField({
            name: 'isActive',
            title: 'Active',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'lastLogin',
            title: 'Last Login',
            type: 'datetime',
            readOnly: true,
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            readOnly: true,
        }),
    ],
})
