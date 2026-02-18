import { getTextPage } from '@/lib/content'
import { PortableText } from '@portabletext/react'

export default async function TermsPage() {
    const pageData = await getTextPage('terms')

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-8">
                {pageData?.title || 'Terms of Service'}
            </h1>
            <div className="prose prose-lg max-w-none text-black">
                {pageData?.content ? (
                    <PortableText value={pageData.content} />
                ) : (
                    <div className="space-y-4 text-black">
                        <p>Please read these terms of service carefully before using our website.</p>
                        
                        <h2 className="text-2xl font-bold mt-6 mb-4">Acceptance of Terms</h2>
                        <p>By accessing and using this website, you accept and agree to be bound by these terms.</p>
                        
                        <h2 className="text-2xl font-bold mt-6 mb-4">Use of Service</h2>
                        <p>You agree to use our service only for lawful purposes and in accordance with these terms.</p>
                        
                        <h2 className="text-2xl font-bold mt-6 mb-4">Product Information</h2>
                        <p>We strive to provide accurate product information, but we cannot guarantee that all details are completely accurate.</p>
                        
                        <h2 className="text-2xl font-bold mt-6 mb-4">Orders and Payment</h2>
                        <p>All orders are subject to acceptance and availability. Payment must be received before orders are processed.</p>
                        
                        <p className="mt-6 text-gray-600">Please add your full terms of service content in Sanity CMS.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
