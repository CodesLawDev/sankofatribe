import { defineType } from 'sanity'

export default defineType({
    name: 'review',
    title: 'Product Review',
    type: 'document',
    fields: [
        {
            name: 'product',
            title: 'Product',
            type: 'reference',
            to: [{ type: 'product' }],
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'author',
            title: 'Author Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.email(),
        },
        {
            name: 'rating',
            title: 'Rating',
            type: 'number',
            validation: (Rule) => Rule.required().min(1).max(5),
        },
        {
            name: 'title',
            title: 'Review Title',
            type: 'string',
            validation: (Rule) => Rule.required().max(100),
        },
        {
            name: 'comment',
            title: 'Comment',
            type: 'text',
            validation: (Rule) => Rule.required().max(1000),
        },
        {
            name: 'verified',
            title: 'Verified Purchase',
            type: 'boolean',
            initialValue: false,
        },
        {
            name: 'featured',
            title: 'Featured Review',
            type: 'boolean',
            initialValue: false,
        },
        {
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        },
    ],
    preview: {
        select: {
            title: 'title',
            author: 'author',
            rating: 'rating',
        },
        prepare({ title, author, rating }) {
            return {
                title,
                subtitle: `${rating}★ - by ${author}`,
            }
        },
    },
})
