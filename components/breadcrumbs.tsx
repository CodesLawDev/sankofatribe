import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs">
                <li>
                    <Link
                        href="/"
                        className="flex items-center text-gray-500 hover:text-black transition-colors"
                    >
                        <Home className="h-3 w-3" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-gray-300" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-gray-500 hover:text-black transition-colors uppercase tracking-wider"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-black uppercase tracking-wider font-medium">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
