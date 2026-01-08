import { client } from './sanity'
import { PortableTextBlock } from '@portabletext/react'

export interface ContentPageData {
    title: string
    slug: { current: string }
    metaDescription?: string
    hero?: {
        title?: string
        subtitle?: string
        image?: any
        showHero: boolean
    }
    content?: PortableTextBlock[]
    sections?: Array<{
        heading: string
        items: Array<{
            title: string
            content: string
            icon?: string
        }>
    }>
    contactInfo?: {
        address?: string
        email?: string
        phone?: string
        hours?: string
    }
}

export async function getContentPage(slug: string): Promise<ContentPageData | null> {
    const query = `*[_type == "contentPage" && slug.current == $slug][0]{
        title,
        slug,
        metaDescription,
        hero,
        content,
        sections,
        contactInfo
    }`

    try {
        const page = await client.fetch(query, { slug }, { next: { revalidate: 60 } })
        return page
    } catch (error) {
        console.error('Error fetching content page:', error)
        return null
    }
}
