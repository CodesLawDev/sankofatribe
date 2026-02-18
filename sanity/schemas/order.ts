import { defineField, defineType } from 'sanity'

export const order = defineType({
    name: 'order',
    title: 'Orders',
    type: 'document',
    fields: [
        defineField({
            name: 'orderId',
            title: 'Order ID',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'orderDate',
            title: 'Order Date',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Order Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending Payment', value: 'pending_payment' },
                    { title: 'Processing', value: 'processing' },
                    { title: 'Shipped', value: 'shipped' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Cancelled', value: 'cancelled' },
                ],
            },
            initialValue: 'pending_payment',
        }),
        defineField({
            name: 'paymentStatus',
            title: 'Payment Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Paid', value: 'paid' },
                    { title: 'Failed', value: 'failed' },
                    { title: 'Refunded', value: 'refunded' },
                ],
            },
            initialValue: 'pending',
        }),
        defineField({
            name: 'paymentReference',
            title: 'Payment Reference',
            type: 'string',
        }),
        defineField({
            name: 'paymentProvider',
            title: 'Payment Provider',
            type: 'string',
            options: {
                list: [
                    { title: 'Paystack', value: 'paystack' },
                    { title: 'Hubtel', value: 'hubtel' },
                ],
            },
        }),
        defineField({
            name: 'customer',
            title: 'Customer',
            type: 'object',
            fields: [
                defineField({ name: 'firstName', title: 'First Name', type: 'string' }),
                defineField({ name: 'lastName', title: 'Last Name', type: 'string' }),
                defineField({ name: 'email', title: 'Email', type: 'string' }),
                defineField({ name: 'phone', title: 'Phone', type: 'string' }),
            ],
        } as any),
        defineField({
            name: 'shippingAddress',
            title: 'Shipping Address',
            type: 'object',
            fields: [
                defineField({ name: 'city', title: 'City/Town', type: 'string' }),
                defineField({ name: 'landmark', title: 'Landmark', type: 'string' }),
            ],
        } as any),
        defineField({
            name: 'items',
            title: 'Items',
            type: 'array',
            of: [
                defineField({
                    type: 'object',
                    fields: [
                        defineField({ name: 'productId', title: 'Product ID', type: 'string' }),
                        defineField({ name: 'name', title: 'Name', type: 'string' }),
                        defineField({ name: 'price', title: 'Price', type: 'number' }),
                        defineField({ name: 'quantity', title: 'Quantity', type: 'number' }),
                        defineField({ name: 'image', title: 'Image URL', type: 'url' }),
                        defineField({ name: 'size', title: 'Size', type: 'string' }),
                    ],
                } as any),
            ],
        } as any),
        defineField({ name: 'subtotal', title: 'Subtotal', type: 'number' }),
        defineField({ name: 'shippingCost', title: 'Shipping Cost', type: 'number' }),
        defineField({ name: 'tax', title: 'Tax', type: 'number' }),
        defineField({ name: 'total', title: 'Total', type: 'number' }),
        defineField({
            name: 'metadata',
            title: 'Metadata',
            type: 'object',
            fields: [
                defineField({ name: 'paymentMethod', title: 'Payment Method', type: 'string' }),
                defineField({ name: 'provider', title: 'Provider', type: 'string' }),
                defineField({ name: 'paidAt', title: 'Paid At', type: 'datetime' }),
            ],
        } as any),
    ],
})
