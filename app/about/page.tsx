import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
    title: 'About Us - SANKOFA',
    description: 'Learn about SANKOFA - our story, values, and commitment to timeless fashion.',
}

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[70vh] bg-neutral-100 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                <div className="relative text-center px-4 max-w-3xl">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.2em] uppercase text-white mb-6">
                        Our Story
                    </h1>
                    <p className="text-sm md:text-base tracking-wider text-white/90">
                        Timeless elegance meets modern sophistication
                    </p>
                </div>
            </section>

            {/* Brand Story */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="text-center mb-16">
                    <h2 className="text-xs uppercase tracking-[0.3em] font-medium mb-8">The SANKOFA Philosophy</h2>
                    <p className="text-lg md:text-xl font-light leading-relaxed text-gray-700">
                        SANKOFA is an Akan word that translates to "go back and get it." It symbolizes the importance of 
                        learning from the past while building toward the future. Our brand embodies this philosophy—creating 
                        timeless pieces that honor tradition while embracing contemporary design.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 md:gap-16 mt-20">
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-6">Our Heritage</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            Founded with a passion for exceptional craftsmanship, SANKOFA represents a new era of 
                            fashion that values quality over quantity, heritage over trends.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Each piece in our collection is thoughtfully designed to become a lasting part of your 
                            wardrobe—garments that transcend seasons and stand the test of time.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-6">Our Commitment</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            We believe in sustainable fashion practices, ethical sourcing, and transparent 
                            manufacturing. Every decision we make considers its impact on our planet and people.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            From selecting premium materials to partnering with skilled artisans, we ensure that 
                            every step of our process reflects our values.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-brand-cream py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                    <h2 className="text-xs uppercase tracking-[0.3em] font-medium mb-16 text-center">Our Values</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-brand-primary">
                                <span className="text-2xl">✦</span>
                            </div>
                            <h3 className="text-sm uppercase tracking-[0.15em] font-medium mb-4">Quality</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Premium materials and meticulous attention to detail in every stitch
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-brand-primary">
                                <span className="text-2xl">◯</span>
                            </div>
                            <h3 className="text-sm uppercase tracking-[0.15em] font-medium mb-4">Sustainability</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Committed to ethical practices and environmental responsibility
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-brand-primary">
                                <span className="text-2xl">◈</span>
                            </div>
                            <h3 className="text-sm uppercase tracking-[0.15em] font-medium mb-4">Timelessness</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Designs that transcend trends and become lasting wardrobe essentials
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-light tracking-wider uppercase mb-6">
                        Explore Our Collection
                    </h2>
                    <p className="text-sm text-gray-600 mb-8">
                        Discover pieces that embody our philosophy of timeless elegance
                    </p>
                    <Link href="/products">
                        <Button size="lg" className="min-w-[200px]">Shop Now</Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
