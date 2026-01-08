import { client } from '@/lib/sanity'

async function getContentPage(slug: string) {
    const query = `*[_type == "contentPage" && slug.current == $slug][0]`
    try {
        return await client.fetch(query, { slug }, { next: { revalidate: 0 } })
    } catch (error) {
        console.error('Error fetching content page:', error)
        return null
    }
}

export default async function PrivacyPage() {
    const pageData = await getContentPage('privacy')

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-8">
                {pageData?.title || 'Privacy Policy'}
            </h1>
            <div className="prose prose-lg max-w-none text-black">
                {pageData?.content ? (
                    <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
                ) : (
                    <div className="space-y-4 text-black">
                        <p>Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.</p>
                        
                        <h2 className="text-2xl font-bold mt-6 mb-4">Information We Collect</h2>
                        <p>We collect information you provide directly to us when you create an account, make a purchase, or contact us.</p>
                        
                        <h2 className="text-2xl font-bold mt-6 mb-4">How We Use Your Information</h2>
                        <p>We use the information we collect to process orders, communicate with you, and improve our services.</p>
                        
                        <h2 className="text-2xl font-bold mt-6 mb-4">Data Protection</h2>
                        <p>We implement appropriate security measures to protect your personal information.</p>
                        
                        <p className="mt-6 text-gray-600">Please add your full privacy policy content in Sanity CMS.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
