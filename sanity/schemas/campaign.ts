import { defineType, defineField } from 'sanity'

export const campaign = defineType({
    name: 'campaign',
    title: 'Sales Campaigns',
    type: 'document',
    description: 'Create site-wide sales campaigns like Black Friday, Summer Sale, etc.',
    fields: [
        defineField({
            name: 'name',
            title: 'Campaign Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'e.g., Black Friday 2026, Summer Sale, Holiday Clearance',
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
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            description: 'Campaign details for internal reference',
        }),
        defineField({
            name: 'startDate',
            title: 'Start Date',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'endDate',
            title: 'End Date',
            type: 'datetime',
            validation: (Rule) =>
                Rule.required().custom((endDate, context) => {
                    const parent = context.parent as any
                    if (!endDate || !parent?.startDate) return true

                    if (new Date(endDate as string) <= new Date(parent.startDate as string)) {
                        return 'End date must be after start date'
                    }

                    return true
                }),
        }),
        defineField({
            name: 'isActive',
            title: 'Active',
            type: 'boolean',
            description: 'Enable or disable this campaign',
            initialValue: true,
        }),
        defineField({
            name: 'bannerImage',
            title: 'Campaign Banner',
            type: 'image',
            options: {
                hotspot: true,
            },
            description: 'Main banner image for the campaign',
        }),
        defineField({
            name: 'bannerTitle',
            title: 'Banner Title',
            type: 'string',
            description: 'e.g., "BLACK FRIDAY SALE"',
        }),
        defineField({
            name: 'bannerSubtitle',
            title: 'Banner Subtitle',
            type: 'string',
            description: 'e.g., "Up to 70% Off Everything"',
        }),
        defineField({
            name: 'showOnHomepage',
            title: 'Show on Homepage',
            type: 'boolean',
            description: 'Display campaign banner on homepage',
            initialValue: true,
        }),
        defineField({
            name: 'showAsPopup',
            title: 'Show as Modal Popup',
            type: 'boolean',
            description: 'Display this campaign as a popup modal on the homepage when users visit',
            initialValue: false,
        }),
        defineField({
            name: 'discountType',
            title: 'Campaign Discount Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Percentage (%)', value: 'percentage' },
                    { title: 'Fixed Amount (₵)', value: 'fixed' },
                    { title: 'Custom per Product', value: 'custom' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'discountValue',
            title: 'Discount Value',
            type: 'number',
            description: 'Site-wide discount (ignored if Custom per Product)',
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as any
                    if (parent?.discountType === 'custom') return true

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
            hidden: ({ parent }) => (parent as any)?.discountType === 'custom',
        }),
        {
            name: 'includedProducts',
            title: 'Included Products',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'product' }] }],
            description: 'Leave empty to apply to all products',
        },
        {
            name: 'includedCategories',
            title: 'Included Categories',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
            description: 'Leave empty to apply to all categories',
        },
        {
            name: 'excludedProducts',
            title: 'Excluded Products',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'product' }] }],
            description: 'Products that should NOT get campaign discount',
        },
        defineField({
            name: 'stackWithPromos',
            title: 'Stack with Promo Codes',
            type: 'boolean',
            description: 'Allow users to apply promo codes on top of campaign discount',
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            name: 'name',
            startDate: 'startDate',
            endDate: 'endDate',
            isActive: 'isActive',
            discountType: 'discountType',
            discountValue: 'discountValue',
            media: 'bannerImage',
        },
        prepare({ name, startDate, endDate, isActive, discountType, discountValue, media }) {
            const start = startDate ? new Date(startDate).toLocaleDateString() : 'TBD'
            const end = endDate ? new Date(endDate).toLocaleDateString() : 'TBD'

            let discount = ''
            if (discountType === 'percentage') {
                discount = `${discountValue}% off`
            } else if (discountType === 'fixed') {
                discount = `₵${discountValue} off`
            } else {
                discount = 'Custom discounts'
            }

            return {
                title: name,
                subtitle: `${discount} • ${start} - ${end} ${isActive ? '✓' : '✗ Inactive'}`,
                media,
            }
        },
    },
})
