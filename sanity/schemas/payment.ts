import { defineType, defineField } from 'sanity'

export const payment = defineType({
    name: 'payment',
    title: 'Payments',
    type: 'document',
    description: 'Record of all payments processed via Paystack',
    fields: [
        defineField({
            name: 'reference',
            title: 'Payment Reference',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'Unique Paystack payment reference',
        }),
        {
            name: 'orderId',
            title: 'Order ID',
            type: 'reference',
            to: [{ type: 'order' }],
            validation: (Rule) => Rule.required(),
        },
        defineField({
            name: 'amount',
            title: 'Amount (in cedis/dollars)',
            type: 'number',
            validation: (Rule) => Rule.required().positive(),
        }),
        defineField({
            name: 'currency',
            title: 'Currency',
            type: 'string',
            options: {
                list: [
                    { title: 'Ghana Cedis (GHS)', value: 'GHS' },
                    { title: 'US Dollar (USD)', value: 'USD' },
                ],
            },
            initialValue: 'GHS',
        }),
        defineField({
            name: 'status',
            title: 'Payment Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Successful', value: 'success' },
                    { title: 'Failed', value: 'failed' },
                    { title: 'Pending', value: 'pending' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'customerEmail',
            title: 'Customer Email',
            type: 'string',
            validation: (Rule) => Rule.required().email(),
        }),
        defineField({
            name: 'customerPhone',
            title: 'Customer Phone',
            type: 'string',
        }),
        defineField({
            name: 'paymentMethod',
            title: 'Payment Method',
            type: 'string',
            description: 'e.g., mobile_money, card, bank_transfer',
        }),
        defineField({
            name: 'paidAt',
            title: 'Paid At',
            type: 'datetime',
        }),
        defineField({
            name: 'verifiedAt',
            title: 'Verified At',
            type: 'datetime',
            description: 'When the payment was verified with Paystack',
        }),
        {
            name: 'paystackResponse',
            title: 'Paystack API Response',
            type: 'text',
            description: 'Full response from Paystack verification',
            hidden: true,
        },
        defineField({
            name: 'notes',
            title: 'Notes',
            type: 'text',
            description: 'Internal notes about the payment',
        }),
    ],
    preview: {
        select: {
            reference: 'reference',
            amount: 'amount',
            status: 'status',
            date: 'paidAt',
        },
        prepare({ reference, amount, status, date }) {
            return {
                title: reference || 'Payment',
                subtitle: `${amount} - ${status} (${new Date(date).toLocaleDateString()})`,
            }
        },
    },
})
