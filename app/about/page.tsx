/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Image from 'next/image'
import { client, urlFor } from '@/lib/sanity'

interface FounderStory {
    founderName: string
    founderRole: string
    founderImage?: any
    founderBio: string
    quote?: string
}

interface HeritageSection {
    title: string
    content: string
    image?: any
}

interface Mission {
    title: string
    content: string
    image?: any
}

interface Vision {
    title: string
    content: string
    image?: any
}

interface Value {
    icon: string
    title: string
    description: string
}

interface TeamMember {
    name: string
    role: string
    bio: string
    image?: any
    email: string
    socials?: {
        twitter?: string
        linkedin?: string
        instagram?: string
    }
}

interface CTASection {
    title: string
    description: string
    buttonText: string
    buttonLink: string
}

interface AboutPageData {
    title: string
    subtitle: string
    heroImage?: any
    heroTitle: string
    heroDescription: string
    founderStory?: FounderStory
    heritageSection?: HeritageSection
    missionSection?: Mission
    visionSection?: Vision
    values?: Value[]
    teamMembers?: TeamMember[]
    ctaSection?: CTASection
}

async function getAboutPageData(): Promise<AboutPageData | null> {
    try {
        const query = `*[_type == "aboutPage"][0]{
            title,
            subtitle,
            heroImage,
            heroTitle,
            heroDescription,
            founderStory,
            heritageSection,
            missionSection,
            visionSection,
            values,
            teamMembers,
            ctaSection
        }`
        const result = await client.fetch<AboutPageData>(query, {}, { next: { revalidate: 3600 } })
        return result || null
    } catch (error) {
        console.error('Failed to fetch about page data:', error)
        return null
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const data = await getAboutPageData()
    
    return {
        title: data?.title ? `${data.title} | SANKOFA TRIBE` : 'About Us | SANKOFA TRIBE',
        description: data?.subtitle || 'Learn about SANKOFA TRIBE\'s story, mission, vision, and the team behind premium African heritage fashion.',
        openGraph: {
            title: data?.title || 'About SANKOFA TRIBE',
            description: data?.subtitle || 'Learn about SANKOFA TRIBE\'s story, mission, vision, and values.',
            type: 'website',
        },
    }
}

export default async function AboutPage() {
    const data = await getAboutPageData()

    if (!data) {
        return (
            <div className="bg-white text-black min-h-screen flex items-center justify-center">
                <div className="text-center max-w-2xl">
                    <h1 className="text-3xl font-bold mb-4">About Us</h1>
                    <p className="text-gray-600 mb-6">
                        Content is being configured. Please check back soon or visit the{' '}
                        <a href="/studio" className="underline font-semibold">
                            Sanity Studio
                        </a>{' '}
                        to add content.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white text-black">
            {/* Hero Section */}
            {data.heroImage && (
                <div className="relative h-[400px] md:h-[500px] w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw]">
                    <Image
                        src={urlFor(data.heroImage).url()}
                        alt={data.heroTitle}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.heroTitle}</h1>
                            <p className="text-lg md:text-xl">{data.heroDescription}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Founder Story Section */}
            {data.founderStory && (
                <section className="py-16 md:py-24 px-4 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Meet the Founder</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            {data.founderStory.founderImage && (
                                <div className="relative h-[500px] rounded-lg overflow-hidden">
                                    <Image
                                        src={urlFor(data.founderStory.founderImage).url()}
                                        alt={data.founderStory.founderName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">{data.founderStory.founderName}</h3>
                                    <p className="text-lg text-gray-600 font-semibold mb-6">
                                        {data.founderStory.founderRole}
                                    </p>
                                </div>
                                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                    {data.founderStory.founderBio}
                                </p>
                                {data.founderStory.quote && (
                                    <blockquote className="text-xl italic border-l-4 border-black pl-6 py-4">
                                        &ldquo;{data.founderStory.quote}&rdquo;
                                    </blockquote>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Heritage Section */}
            {data.heritageSection && (
                <section className="py-16 md:py-24 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{data.heritageSection.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                    {data.heritageSection.content}
                                </p>
                            </div>
                            {data.heritageSection.image && (
                                <div className="relative h-[400px] rounded-lg overflow-hidden order-1 md:order-2">
                                    <Image
                                        src={urlFor(data.heritageSection.image).url()}
                                        alt={data.heritageSection.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Mission Section */}
            {data.missionSection && (
                <section className="py-16 md:py-24 px-4 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{data.missionSection.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            {data.missionSection.image && (
                                <div className="relative h-[400px] rounded-lg overflow-hidden">
                                    <Image
                                        src={urlFor(data.missionSection.image).url()}
                                        alt={data.missionSection.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                    {data.missionSection.content}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Vision Section */}
            {data.visionSection && (
                <section className="py-16 md:py-24 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{data.visionSection.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                    {data.visionSection.content}
                                </p>
                            </div>
                            {data.visionSection.image && (
                                <div className="relative h-[400px] rounded-lg overflow-hidden order-1 md:order-2">
                                    <Image
                                        src={urlFor(data.visionSection.image).url()}
                                        alt={data.visionSection.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Core Values Section */}
            {data.values && data.values.length > 0 && (
                <section className="py-16 md:py-24 px-4 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Our Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {data.values.map((value: Value, index: number) => (
                                <div key={index} className="text-center">
                                    <div className="text-5xl mb-4">{value.icon}</div>
                                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Team Section */}
            {data.teamMembers && data.teamMembers.length > 0 && (
                <section className="py-16 md:py-24 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Meet Our Team</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {data.teamMembers.map((member: TeamMember, index: number) => (
                                <div key={index} className="text-center">
                                    {member.image && (
                                        <div className="relative h-[300px] mb-4 rounded-lg overflow-hidden">
                                            <Image
                                                src={urlFor(member.image).url()}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                                    <p className="text-gray-600 font-semibold mb-3">{member.role}</p>
                                    <p className="text-gray-700 text-sm mb-4">{member.bio}</p>
                                    {member.email && (
                                        <p className="text-sm mb-3">
                                            <a href={`mailto:${member.email}`} className="underline text-gray-600 hover:text-black">
                                                {member.email}
                                            </a>
                                        </p>
                                    )}
                                    {member.socials && (
                                        <div className="flex justify-center gap-3">
                                            {member.socials.twitter && (
                                                <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black">
                                                    <span className="text-lg">𝕏</span>
                                                </a>
                                            )}
                                            {member.socials.linkedin && (
                                                <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black">
                                                    <span className="text-lg">in</span>
                                                </a>
                                            )}
                                            {member.socials.instagram && (
                                                <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black">
                                                    <span className="text-lg">📷</span>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            {data.ctaSection && (
                <section className="py-16 md:py-24 px-4 bg-black text-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">{data.ctaSection.title}</h2>
                        <p className="text-lg mb-8 opacity-90">{data.ctaSection.description}</p>
                        <a
                            href={data.ctaSection.buttonLink}
                            className="inline-block px-8 py-3 bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
                        >
                            {data.ctaSection.buttonText}
                        </a>
                    </div>
                </section>
            )}
        </div>
    )
}
