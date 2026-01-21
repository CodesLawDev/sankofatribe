import { client } from './sanity'
import { PortableTextBlock } from '@portabletext/react'

export interface TextPageData {
    title: string
    slug: { current: string }
    content?: PortableTextBlock[]
}

export interface FAQData {
    title: string
    description?: string
    faqs?: Array<{
        question: string
        answer: string
    }>
}

export async function getTextPage(slug: string): Promise<TextPageData | null> {
    const query = `*[_type == "textPage" && slug.current == $slug][0]{
        title,
        slug,
        content
    }`

    try {
        return await client.fetch(query, { slug }, { next: { revalidate: 60 } })
    } catch (error) {
        console.error(`Error fetching text page ${slug}:`, error)
        return null
    }
}

export async function getFAQPage(): Promise<FAQData | null> {
    const query = `*[_type == "faq"][0]{
        title,
        description,
        faqs
    }`

    try {
        return await client.fetch(query, {}, { next: { revalidate: 60 } })
    } catch (error) {
        console.error('Error fetching FAQ page:', error)
        return null
    }
}
