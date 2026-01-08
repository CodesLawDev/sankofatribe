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
        <section className="py-16 md:py-24 bg-white">
            <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-12 text-center">Shop by Category</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link key={category.id} href={category.link}>
                            <div className="group relative h-80 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg">
                                {/* Only render image if URL is provided and not a placeholder */}
                                {category.image && !category.image.includes('placeholder') && (
                                    <>
                                        <Image
                                            src={category.image}
                                            alt={category.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                                    </>
                                )}
                                <div className="absolute inset-0 flex items-end justify-start p-6">
                                    <h3 className="text-white text-2xl font-bold">{category.title}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
