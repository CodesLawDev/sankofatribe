import { defineField, defineType } from 'sanity'

export const career = defineType({
    name: 'career',
    title: 'Career Opportunity',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Role Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title', maxLength: 96 },
        }),
        defineField({
            name: 'department',
            title: 'Department',
            type: 'string',
        }),
        defineField({
            name: 'employmentType',
            title: 'Employment Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Full-time', value: 'full-time' },
                    { title: 'Part-time', value: 'part-time' },
                    { title: 'Contract', value: 'contract' },
                    { title: 'Internship', value: 'internship' },
                    { title: 'Temporary', value: 'temporary' },
                ],
            },
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
        }),
        defineField({
            name: 'isRemote',
            title: 'Remote-friendly',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'salaryRange',
            title: 'Salary Range',
            type: 'string',
            description: 'Optional. Example: GHS 8,000 - 12,000 / month',
        }),
        defineField({
            name: 'summary',
            title: 'Short Summary',
            type: 'text',
        }),
        {
            name: 'description',
            title: 'Role Description',
            type: 'array',
            of: [{ type: 'block' }],
        },
        {
            name: 'responsibilities',
            title: 'Key Responsibilities',
            type: 'array',
            of: [{ type: 'text' }],
        },
        {
            name: 'requirements',
            title: 'Requirements',
            type: 'array',
            of: [{ type: 'text' }],
        },
        {
            name: 'perks',
            title: 'Benefits / Perks',
            type: 'array',
            of: [{ type: 'text' }],
        },
        defineField({
            name: 'applicationUrl',
            title: 'Application URL',
            type: 'url',
        }),
        defineField({
            name: 'applicationEmail',
            title: 'Application Email',
            type: 'string',
            description: 'If provided, applicants can email directly.',
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Open', value: 'open' },
                    { title: 'Closed', value: 'closed' },
                    { title: 'Draft', value: 'draft' },
                ],
            },
            initialValue: 'open',
        }),
        defineField({
            name: 'postedAt',
            title: 'Posted Date',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
        defineField({
            name: 'closingDate',
            title: 'Closing Date',
            type: 'date',
        }),
        defineField({
            name: 'featured',
            title: 'Featured',
            type: 'boolean',
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'department',
            status: 'status',
        },
        prepare({ title, subtitle, status }) {
            return {
                title,
                subtitle: [subtitle, status && `Status: ${status}`].filter(Boolean).join(' • '),
            }
        },
    },
})
