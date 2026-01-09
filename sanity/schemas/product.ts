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
    ],
    preview: {
        select: {
            title: 'name',
            media: 'images.0',
            price: 'price',
        },
        prepare(selection) {
            const { title, media, price } = selection
            return {
                title,
                media,
                subtitle: `$${price}`,
            }
        },
    },
})
