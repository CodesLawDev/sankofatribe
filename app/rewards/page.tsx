import { Metadata } from 'next'
import Link from 'next/link'
import { Award, Star, Diamond, Crown, Check } from 'lucide-react'

export const metadata: Metadata = {
    title: 'MySankofa Rewards | SANKOFA TRIBE',
    description: 'Join the MySankofa Rewards program to earn points, unlock exclusive perks, and gain access to members-only events.',
}

export default function RewardsPage() {
    const tiers = [
        {
            name: 'Bronze',
            icon: <Star className="w-8 h-8 text-amber-700" />,
            points: '0 - 500 Points',
            benefits: [
                '1 Point per $1 spent',
                'Birthday surprise',
                'Early access to sales',
            ]
        },
        {
            name: 'Silver',
            icon: <Award className="w-8 h-8 text-slate-400" />,
            points: '501 - 2000 Points',
            benefits: [
                '1.25 Points per $1 spent',
                'Birthday surprise',
                'Early access to sales',
                'Free standard shipping',
            ]
        },
        {
            name: 'Gold',
            icon: <Crown className="w-8 h-8 text-amber-500" />,
            points: '2001 - 5000 Points',
            benefits: [
                '1.5 Points per $1 spent',
                'Premium birthday gift',
                'Early access to sales & drops',
                'Free expedited shipping',
                'Dedicated customer service',
            ]
        },
        {
            name: 'Obsidian',
            icon: <Diamond className="w-8 h-8 text-slate-900 dark:text-white" />,
            points: '5000+ Points',
            benefits: [
                '2 Points per $1 spent',
                'Luxury birthday gift',
                'First access to all collections',
                'Free expedited shipping',
                'Dedicated concierge',
                'Exclusive VIP events access',
            ]
        }
    ]

    return (
        <div className="bg-white text-black min-h-screen">
            {/* Hero Section */}
            <section className="bg-black text-white py-24 md:py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/placeholder-pattern.png')] opacity-10 mix-blend-overlay"></div>
                <div className="max-w-3xl mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-light tracking-[0.2em] uppercase mb-6">
                        MySankofa Rewards
                    </h1>
                    <p className="text-sm md:text-base text-gray-300 tracking-wide mb-10 max-w-xl mx-auto leading-relaxed">
                        Elevate your journey with SANKOFA TRIBE. Earn points with every purchase and unlock a world of exclusive benefits, early access, and curated experiences.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="bg-white text-black px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors w-full sm:w-auto">
                            Join Now
                        </Link>
                        <Link href="/login" className="bg-transparent border border-white text-white px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-white/10 transition-colors w-full sm:w-auto">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-brand-cream">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
                    <h2 className="text-2xl font-light tracking-wider uppercase mb-12">How To Earn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-white/50 rounded-xl">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-light">1</div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Create Account</h3>
                            <p className="text-sm text-gray-600">Join MySankofa Rewards and instantly earn 50 welcome points.</p>
                        </div>
                        <div className="p-6 bg-white/50 rounded-xl">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-light">2</div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Shop & Earn</h3>
                            <p className="text-sm text-gray-600">Earn points for every dollar spent on sankofatribe.com.</p>
                        </div>
                        <div className="p-6 bg-white/50 rounded-xl">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-light">3</div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Unlock Tiers</h3>
                            <p className="text-sm text-gray-600">Level up to higher tiers to multiply your points and unlock exclusive perks.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tiers */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                    <h2 className="text-2xl font-light tracking-wider uppercase mb-16 text-center">Membership Tiers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tiers.map((tier) => (
                            <div key={tier.name} className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow flex flex-col">
                                <div className="flex justify-center mb-6">
                                    {tier.icon}
                                </div>
                                <h3 className="text-center text-xl font-bold uppercase tracking-widest mb-2">{tier.name}</h3>
                                <p className="text-center text-sm text-gray-500 font-medium tracking-wide mb-8">{tier.points}</p>
                                
                                <ul className="space-y-4 flex-grow">
                                    {tier.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Teaser */}
            <section className="py-20 bg-gray-50 text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-xl font-light tracking-wider uppercase mb-4">Have Questions?</h2>
                    <p className="text-sm text-gray-600 mb-8">
                        Learn more about point expiration, tier qualification, and how to redeem your rewards in our help center.
                    </p>
                    <Link href="/faq" className="inline-block border-b border-black text-xs font-bold uppercase tracking-widest pb-1 hover:text-gray-500 transition-colors">
                        View Rewards FAQ
                    </Link>
                </div>
            </section>
        </div>
    )
}
