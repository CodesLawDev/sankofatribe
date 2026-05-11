import Image from 'next/image'
import Link from 'next/link'

interface FeaturedCategory {
    id: string
    title: string
    image: string
    link: string
}

interface FeaturedCategoriesProps {
    categories: FeaturedCategory[]
}

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
            <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-12 text-center text-slate-900 dark:text-white">Shop by Category</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link key={category.id} href={category.link}>
                            <div className="group relative h-80 overflow-hidden glass-lg rounded-2xl hover:shadow-2xl transition-all duration-500">
                                {/* Only render image if URL is provided and not a placeholder */}
                                {category.image && !category.image.includes('placeholder') && (
                                    <>
                                        <Image
                                            src={category.image}
                                            alt={category.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/30 transition-all duration-300" />
                                    </>
                                )}
                                <div className="absolute inset-0 flex items-end justify-start p-6">
                                    <div className="glass-md p-4 rounded-xl backdrop-blur-md bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-white/10">
                                        <h3 className="text-white text-2xl font-bold group-hover:text-cyan-200 transition-colors">{category.title}</h3>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
