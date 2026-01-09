import { defineType, defineField } from 'sanity'

export const product = defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Product Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        {
            name: 'images',
            title: 'Product Images',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
            validation: (Rule: any) => Rule.required().min(1),
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 5,
        },
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
            validation: (Rule) => Rule.required().positive(),
        }),
        defineField({
            name: 'audience',
            title: 'Audience',
            type: 'string',
            options: {
                list: [
                    { title: 'Men', value: 'men' },
                    { title: 'Women', value: 'women' },
                    { title: 'Kids', value: 'kids' },
                    { title: 'Unisex', value: 'unisex' },
                ],
            },
            description: 'Who is this product for? Used for filters on the shop page.',
        }),
        {
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
            description: 'Select one or more categories for this product',
        },
        {
            name: 'sizes',
            title: 'Available Sizes',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'size',
                            title: 'Size',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'XS', value: 'xs' },
                                    { title: 'S', value: 's' },
                                    { title: 'M', value: 'm' },
                                    { title: 'L', value: 'l' },
                                    { title: 'XL', value: 'xl' },
                                    { title: 'XXL', value: 'xxl' },
                                ],
                            },
                            validation: (Rule: any) => Rule.required(),
                        },
                        {
                            name: 'stock',
                            title: 'Stock Quantity',
                            type: 'number',
                            description: 'Number of items in this size',
                            initialValue: 0,
                            validation: (Rule: any) => Rule.required().min(0),
                        },
                    ],
                },
            ],
        },
        {
            name: 'colors',
            title: 'Available Colors',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'name', title: 'Color Name', type: 'string' },
                        { name: 'hex', title: 'Hex Code', type: 'string' },
                    ],
                },
            ],
        },
        defineField({
            name: 'featured',
            title: 'Featured Product',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'inStock',
            title: 'In Stock',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'soldCount',
            title: 'Sold Count',
            type: 'number',
            description: 'Total number sold (for social proof)',
            initialValue: 0,
        }),
        defineField({
            name: 'hasDiscount',
            title: 'Has Discount',
            type: 'boolean',
            description: 'Enable product-level discount (overrides campaign discounts)',
            initialValue: false,
        }),
        defineField({
            name: 'discountType',
            title: 'Discount Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Percentage (%)', value: 'percentage' },
                    { title: 'Fixed Amount (₵)', value: 'fixed' },
                ],
            },
            hidden: ({ parent }) => !(parent as any)?.hasDiscount,
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as any
                    if (parent?.hasDiscount && !value) {
                        return 'Discount type is required when discount is enabled'
                    }
                    return true
                }),
        }),
        defineField({
            name: 'discountValue',
            title: 'Discount Value',
            type: 'number',
            description: 'Percentage (0-100) or fixed amount',
            hidden: ({ parent }) => !(parent as any)?.hasDiscount,
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as any
                    if (!parent?.hasDiscount) return true

                    if (value === undefined || value === null) {
                        return 'Discount value is required'
                    }

                    if ((value as number) <= 0) {
                        return 'Discount value must be greater than 0'
                    }

                    if (parent.discountType === 'percentage' && (value as number) > 100) {
                        return 'Percentage cannot exceed 100%'
                    }

                    if (parent.discountType === 'fixed' && (value as number) >= parent.price) {
                        return 'Fixed discount must be less than product price'
                    }

                    return true
                }),
        }),
        defineField({
            name: 'discountStartDate',
            title: 'Discount Start Date',
            type: 'datetime',
            description: 'When the discount becomes active',
            hidden: ({ parent }) => !(parent as any)?.hasDiscount,
        }),
        defineField({
            name: 'discountEndDate',
            title: 'Discount End Date',
            type: 'datetime',
            description: 'When the discount expires',
            hidden: ({ parent }) => !(parent as any)?.hasDiscount,
            validation: (Rule) =>
                Rule.custom((endDate, context) => {
                    const parent = context.parent as any
                    if (!parent?.hasDiscount || !endDate || !parent?.discountStartDate) {
                        return true
                    }

                    if (new Date(endDate as string) <= new Date(parent.discountStartDate as string)) {
                        return 'End date must be after start date'
                    }

                    return true
                }),
        }),
    ],
    preview: {
        select: {
            title: 'name',
            media: 'images.0',
            price: 'price',
            hasDiscount: 'hasDiscount',
            discountType: 'discountType',
            discountValue: 'discountValue',
        },
        prepare(selection) {
            const { title, media, price, hasDiscount, discountType, discountValue } = selection

            let subtitle = `₵${price}`

            if (hasDiscount && discountValue) {
                let discountedPrice = price
                if (discountType === 'percentage') {
                    discountedPrice = price - (price * discountValue) / 100
                } else if (discountType === 'fixed') {
                    discountedPrice = price - discountValue
                }
                subtitle = `₵${discountedPrice.toFixed(2)} (was ₵${price})`
            }

            return {
                title,
                media,
                subtitle,
            }
        },
    },
})
