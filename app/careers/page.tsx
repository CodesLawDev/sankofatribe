import { getOpenCareers } from '@/lib/careers'
import { Career } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Briefcase, MapPin, Clock4 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
    title: 'Careers at SANKOFA Tribe',
    description: 'Join the creators, technologists, and strategists shaping modern African heritage fashion.',
}

function formatDate(value?: string) {
    if (!value) return null
    try {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
    } catch (error) {
        console.error('Error formatting date:', error)
        return null
    }
}

function buildLocation(career: Career) {
    if (career.isRemote && career.location) {
        return `${career.location} · Remote`
    }
    if (career.isRemote) {
        return 'Remote'
    }
    return career.location || 'On-site'
}

function getApplyLink(career: Career) {
    if (career.applicationUrl) return career.applicationUrl
    if (career.applicationEmail) return `mailto:${career.applicationEmail}`
    return null
}

export default async function CareersPage() {
    const careers = await getOpenCareers()

    return (
        <div className="bg-white text-black min-h-screen">
            <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-700 to-amber-400 text-white">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute right-6 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-2xl" />
                </div>
                <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-16 md:py-20">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-4 md:max-w-3xl">
                            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Careers</p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
                                Build the future of modern African heritage fashion with us
                            </h1>
                            <p className="text-base md:text-lg text-white/85">
                                We are a collective of designers, engineers, strategists, and storytellers crafting experiences that
                                honor tradition and push culture forward. Explore our open roles and join the tribe.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 text-sm text-white/80 md:text-right">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 backdrop-blur-sm">
                                <Briefcase size={16} />
                                Growth-focused team
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 backdrop-blur-sm">
                                <MapPin size={16} />
                                Hybrid opportunities
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-16 md:py-20">
                {careers.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-8 py-12 text-center">
                        <p className="text-lg font-medium text-gray-800">No open roles right now.</p>
                        <p className="mt-2 text-gray-600">
                            We update opportunities frequently. Check back soon or reach out via{' '}
                            <a href="mailto:careers@sankofatribe.com" className="underline">careers@sankofatribe.com</a>.
                        </p>
                    </div>
                )}

                {careers.length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-semibold">Open Roles</h2>
                                <p className="text-gray-600">Featured first, then most recent.</p>
                            </div>
                            <span className="rounded-full bg-gray-900 text-white text-sm px-4 py-2">
                                {careers.length} position{careers.length === 1 ? '' : 's'}
                            </span>
                        </div>

                        <div className="grid gap-6">
                            {careers.map((career) => {
                                const location = buildLocation(career)
                                const applyLink = getApplyLink(career)
                                const posted = formatDate(career.postedAt)
                                const closing = formatDate(career.closingDate)

                                return (
                                    <div
                                        key={career._id}
                                        className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        {career.featured && (
                                            <div className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                                                Featured
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                                        {career.department && (
                                                            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                                                                <Briefcase size={14} />
                                                                {career.department}
                                                            </span>
                                                        )}
                                                        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                                                            <MapPin size={14} />
                                                            {location}
                                                        </span>
                                                        {career.employmentType && (
                                                            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                                                                <Clock4 size={14} />
                                                                {career.employmentType.replace('-', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-2xl font-semibold text-gray-900">{career.title}</h3>
                                                    {career.summary && <p className="text-gray-700 max-w-3xl">{career.summary}</p>}
                                                    {career.salaryRange && (
                                                        <p className="text-sm font-medium text-amber-700">Compensation: {career.salaryRange}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2 text-sm text-gray-600 md:items-end">
                                                    {posted && <span>Posted {posted}</span>}
                                                    {closing && <span>Closes {closing}</span>}
                                                </div>
                                            </div>

                                            {career.description && (
                                                <div className="prose max-w-none text-gray-800 prose-p:my-2 prose-li:my-1">
                                                    <PortableText value={career.description} />
                                                </div>
                                            )}

                                            <div className="grid gap-6 md:grid-cols-3">
                                                {career.responsibilities && career.responsibilities.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Impact</h4>
                                                        <ul className="space-y-2 text-gray-700">
                                                            {career.responsibilities.map((item, idx) => (
                                                                <li key={idx} className="flex gap-2">
                                                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-600" />
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {career.requirements && career.requirements.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">What you bring</h4>
                                                        <ul className="space-y-2 text-gray-700">
                                                            {career.requirements.map((item, idx) => (
                                                                <li key={idx} className="flex gap-2">
                                                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-900" />
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {career.perks && career.perks.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Benefits</h4>
                                                        <ul className="space-y-2 text-gray-700">
                                                            {career.perks.map((item, idx) => (
                                                                <li key={idx} className="flex gap-2">
                                                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-700" />
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {applyLink && (
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <Link href={applyLink} target={applyLink.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
                                                        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                                                            Apply now
                                                            <ArrowUpRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {career.applicationEmail && !career.applicationUrl && (
                                                        <p className="text-sm text-gray-600">Prefer email? {career.applicationEmail}</p>
                                                    )}
                                                </div>
                                            )}

                                            {!applyLink && (
                                                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                                                    Application details will be posted soon. For questions, contact careers@sankofatribe.com.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
