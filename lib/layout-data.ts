import { client } from '@/lib/sanity'

/**
 * Pre-fetch layout data (navigation + announcement + footer settings) on the
 * server so the client components receive it as props instead of fetching in
 * useEffect. This eliminates the data-fetching waterfall and ensures the first
 * paint already contains the correct nav/footer content.
 */

export interface NavItem {
  name: string
  href: string
  external?: boolean
}

export interface AnnouncementData {
  text: string
  link?: string
  backgroundColor: string
  textColor: string
  isActive: boolean
}

export interface FooterLink {
  text: string
  url: string
}

export interface FooterSection {
  heading: string
  links: FooterLink[]
}

export interface FooterData {
  sections: FooterSection[]
  socialLinks: {
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
  }
  bottomSection: Array<{
    title: string
    description: string
  }>
  copyrightText: string
  legalLinks: FooterLink[]
  showSections?: boolean
  showSocialLinks?: boolean
  showBottomSection?: boolean
  showLegalLinks?: boolean
}

export interface LayoutData {
  navItems: NavItem[]
  announcement: AnnouncementData | null
  footerData: FooterData | null
}

const DEFAULT_NAV: NavItem[] = [
  { name: 'New & Featured', href: '/products' },
  { name: 'Men', href: '/category/men' },
  { name: 'Women', href: '/category/women' },
  { name: 'Kids', href: '/products' },
  { name: 'Sale', href: '/products' },
  { name: 'Events', href: '/events' },
]

export async function fetchLayoutData(): Promise<LayoutData> {
  try {
    const [navData, announcementData, footerSettings] = await Promise.all([
      client
        .fetch<{ items?: NavItem[] } | null>(
          `*[_type == "navigation" && slug.current == "main-nav"][0]{ items }`,
          {},
          { next: { revalidate: 300 } }
        )
        .catch(() => null),
      client
        .fetch<AnnouncementData | null>(
          `*[_type == "announcement"][0]`,
          {},
          { next: { revalidate: 60 } }
        )
        .catch(() => null),
      client
        .fetch<FooterData | null>(
          `*[_type == "footerSettings"][0]{
            _id, title, showSections, showSocialLinks, showBottomSection,
            showLegalLinks, sections, socialLinks, bottomSection,
            copyrightText, legalLinks
          }`,
          {},
          { next: { revalidate: 300 } }
        )
        .catch(() => null),
    ])

    return {
      navItems: navData?.items ?? DEFAULT_NAV,
      announcement: announcementData?.isActive ? announcementData : null,
      footerData: footerSettings,
    }
  } catch {
    return {
      navItems: DEFAULT_NAV,
      announcement: null,
      footerData: null,
    }
  }
}
