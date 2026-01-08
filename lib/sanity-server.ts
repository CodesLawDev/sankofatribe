import { createClient } from 'next-sanity'

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN

export const serverClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    useCdn: false,
    token,
    perspective: 'published',
})

export function assertSanityToken() {
    if (!token) {
        throw new Error('Missing SANITY_WRITE_TOKEN environment variable')
    }
}
