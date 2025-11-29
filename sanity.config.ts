import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
    name: 'default',
    title: 'Sankofa Tribe Fashion',

    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

    plugins: [deskTool(), visionTool()],

    schema: {
        types: schemaTypes,
    },

    basePath: '/studio',
})
