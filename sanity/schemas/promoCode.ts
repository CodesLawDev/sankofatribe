import { defineType, defineField } from 'sanity'

export const promoCode = defineType({
    name: 'promoCode',
    title: 'Promo Codes',
    type: 'document',
    fields: [
        defineField({
            name: 'code',
            title: 'Promo Code',
            type: 'string',
            validation: (Rule) => Rule.required().uppercase().min(3).max(20),
            description: 'e.g., WELCOME20, FLASH50, BLACKFRIDAY',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'Internal description of this promo code',
        }),
        defineField({
            name: 'discountType',
            title: 'Discount Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Percentage (%)', value: 'percentage' },
                    { title: 'Fixed Amount (₵)', value: 'fixed' },
                    { title: 'Free Shipping', value: 'free_shipping' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'discountValue',
            title: 'Discount Value',
            type: 'number',
            description: 'For percentage: enter 20 for 20%. For fixed: enter amount in cedis',
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as any
                    if (parent?.discountType === 'free_shipping') return true

                    if (value === undefined || value === null) {
                        return 'Discount value is required'
                    }

                    if ((value as number) <= 0) {
                        return 'Discount value must be greater than 0'
                    }

                    if (parent.discountType === 'percentage' && (value as number) > 100) {
                        return 'Percentage cannot exceed 100%'
                    }

                    return true
                }),
            hidden: ({ parent }) => (parent as any)?.discountType === 'free_shipping',
        }),
        defineField({
            name: 'minimumPurchase',
            title: 'Minimum Purchase Amount',
            type: 'number',
            description: 'Minimum cart total required (in cedis). 0 for no minimum',
            initialValue: 0,
            validation: (Rule) => Rule.min(0),
        }),
        defineField({
            name: 'maxDiscount',
            title: 'Maximum Discount Amount',
            type: 'number',
            description: 'Cap the discount amount (useful for percentage discounts). 0 for no cap',
            initialValue: 0,
            validation: (Rule) => Rule.min(0),
            hidden: ({ parent }) => (parent as any)?.discountType !== 'percentage',
        }),
        defineField({
            name: 'usageLimit',
            title: 'Total Usage Limit',
            type: 'number',
            description: 'Maximum number of times this code can be used overall. 0 = unlimited',
            initialValue: 0,
            validation: (Rule) => Rule.min(0).integer(),
        }),
        defineField({
            name: 'usageLimitPerCustomer',
            title: 'Usage Limit Per Customer',
            type: 'number',
            description: 'Maximum uses per customer. 0 = unlimited',
            initialValue: 1,
            validation: (Rule) => Rule.min(0).integer(),
        }),
        defineField({
            name: 'timesUsed',
            title: 'Times Used',
            type: 'number',
            description: 'Tracks total usage (auto-incremented)',
            initialValue: 0,
            readOnly: true,
        }),
        defineField({
            name: 'validFrom',
            title: 'Valid From',
            type: 'datetime',
            description: 'When does this code become active?',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'validUntil',
            title: 'Valid Until',
            type: 'datetime',
            description: 'When does this code expire?',
            validation: (Rule) =>
                Rule.custom((endDate, context) => {
                    const parent = context.parent as any
                    if (!endDate || !parent?.validFrom) return true

                    if (new Date(endDate as string) <= new Date(parent.validFrom as string)) {
                        return 'Expiry date must be after start date'
                    }

                    return true
                }),
        }),
        defineField({
            name: 'isActive',
            title: 'Active',
            type: 'boolean',
            description: 'Enable or disable this promo code',
            initialValue: true,
        }),
        {
            name: 'applicableProducts',
            title: 'Applicable Products',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'product' }] }],
            description: 'Leave empty to apply to all products',
        },
        {
            name: 'applicableCategories',
            title: 'Applicable Categories',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
            description: 'Leave empty to apply to all categories',
        },
        defineField({
            name: 'firstTimeCustomerOnly',
            title: 'First-Time Customers Only',
            type: 'boolean',
            description: 'Restrict to customers with no previous orders',
            initialValue: false,
        }),
        defineField({
            name: 'subscribersOnly',
            title: 'Newsletter Subscribers Only',
            type: 'boolean',
            description: 'Restrict to emails that are active newsletter subscribers (e.g. the welcome code)',
            initialValue: false,
        }),
        defineField({
            name: 'singleItemOnly',
            title: 'Apply To A Single Item Only',
            type: 'boolean',
            description: 'When on, the discount applies to one item only (the most expensive unit), not the whole cart',
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            code: 'code',
            discountType: 'discountType',
            discountValue: 'discountValue',
            isActive: 'isActive',
            timesUsed: 'timesUsed',
        },
        prepare({ code, discountType, discountValue, isActive, timesUsed }) {
            let discount = ''
            if (discountType === 'percentage') {
                discount = `${discountValue}% off`
            } else if (discountType === 'fixed') {
                discount = `₵${discountValue} off`
            } else {
                discount = 'Free Shipping'
            }

            return {
                title: code,
                subtitle: `${discount} • Used ${timesUsed || 0}x ${isActive ? '✓' : '✗ Inactive'}`,
            }
        },
    },
})
