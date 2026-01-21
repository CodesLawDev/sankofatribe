import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'faq',
    title: 'FAQ Page',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Page Title',
            type: 'string',
            initialValue: 'Frequently Asked Questions',
        }),
        defineField({
            name: 'description',
            title: 'Intro Description',
            type: 'text',
        }),
        defineField({
            name: 'faqs',
            title: 'Questions & Answers',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'question', type: 'string', title: 'Question' },
                        { name: 'answer', type: 'text', title: 'Answer' },
                    ],
                    preview: {
                        select: {
                            title: 'question',
                            subtitle: 'answer',
                        },
                    },
                },
            ],
        }),
    ],
})
