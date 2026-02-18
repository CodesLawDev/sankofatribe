# Nike Redesign - Design Specifications & Color Palette

## Color Palette

### Primary Colors
```
Black:           #000000 (Pure black for header, footer, text)
White:           #FFFFFF (Background, text on dark)
Gray-50:         #F9FAFB (Light background, hover states)
Gray-100:        #F3F4F6 (Secondary background)
Gray-400:        #9CA3AF (Light text, disabled states)
Gray-500:        #6B7280 (Medium text)
Gray-600:        #4B5563 (Darker text)
Gray-700:        #374151 (Dark text)
Gray-800:        #1F2937 (Very dark text)
Gray-900:        #111827 (Almost black text)
Red-600:         #DC2626 (Sale badge, urgency)
```

### Brand Colors (Preserved)
```
Primary:         #8B5E3C (Warm brown - kept for accents)
Accent:          #D4A373 (Tan/gold - reserved for highlights)
Cream:           #FCF8F3 (Off-white - sections/backgrounds)
Dark:            #1A1A1A (Deep black for text)
```

## Typography

### Font Stack
```
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif
Nike Reference: Uses "Nike Grotesk" + system fonts
Sankofa Approach: System font stack for performance
```

### Type Scales

#### Headings
- **H1**: 3.75rem (60px) - Hero titles
- **H2**: 2.25rem (36px) - Section titles
- **H3**: 1.875rem (30px) - Subsection titles
- **H4**: 1.25rem (20px) - Component titles
- **H5**: 1rem (16px) - Labels, emphasis

#### Body Text
- **Large**: 1.125rem (18px) - Body text, descriptions
- **Regular**: 1rem (16px) - Default body text
- **Small**: 0.875rem (14px) - Secondary text, captions
- **XSmall**: 0.75rem (12px) - Footer, fine print

### Font Weights
```
Light:    300 (Rare, only for premium spacing)
Regular:  400 (Body text)
Medium:   500 (Secondary emphasis)
Semibold: 600 (Component titles)
Bold:     700 (Headings, emphasis)
Extrabold: 800 (Hero headlines)
```

## Spacing System

### Scale (in rem / pixels)
```
2xs:   0.25rem (4px)
xs:    0.5rem (8px)
sm:    0.75rem (12px)
md:    1rem (16px)
lg:    1.5rem (24px)
xl:    2rem (32px)
2xl:   2.5rem (40px)
3xl:   3rem (48px)
4xl:   4rem (64px)
```

### Common Spacing
- Section padding: `py-20 md:py-32` (80px / 128px)
- Container padding: `px-4 sm:px-6 lg:px-12` (16px / 24px / 48px)
- Gap between items: `gap-6 md:gap-8` (24px / 32px)
- Element margins: Minimal, use padding instead

## Component Specifications

### Header
```
Height:           64px
Background:       White (#FFFFFF)
Announcement Bar: Black (#000000), height 32px
Navigation:       Text-sm, centered, uppercase tracking-wider
Logo:             Centered
Icons:            Search + Cart, right-aligned
Mobile Hamburger: Shows on md breakpoint
Z-Index:          50 (sticky/fixed positioning)
Border Bottom:    1px solid gray-200 (subtle divider)
```

### Hero Banner
```
Heights:
  Mobile:        h-[60vh]
  Tablet:        md:h-[75vh]
  Desktop:       lg:h-[85vh]

Image:           Object cover, full bleed
Overlay:         Black/20 opacity (can adjust per banner)
Text Positioning: left | center | right (via flexbox)
Text Color:      white | black
CTA Button:      White background, black text when white text
Font:            text-4xl to text-7xl, bold
```

### Product Cards
```
Aspect Ratio:    3:4 (product-standard)
Image Scale:     1.05x on hover (smooth 500ms transition)
Padding:         None on image, mb-6 below
Product Name:    text-sm font-medium
Category:        text-xs text-gray-600
Price:           text-sm font-semibold
Urgency Badge:   text-xs text-red-600 (Only X left)
Card Hover:      Subtle opacity shift on text
Wishlist:        Always visible mobile, hover on desktop
```

### Footer
```
Background:      Black (#000000)
Text Color:      White (default), Gray-400 (secondary)
Column Structure: 2 cols (mobile) → 3 cols (tablet) → 6 cols (desktop)
Section Padding: py-20 (main content), py-6 (bottom bar)
Link Text:       text-xs, uppercase tracking-wider
Hover State:     text-white (from gray-400)
Dividers:        border-gray-800 (subtle black borders)
Newsletter:      Border-gray-700, white text on dark
```

### Featured Categories
```
Grid:            2 cols (mobile), 2 cols (tablet), 3 cols (desktop)
Aspect Ratio:    N/A (flexible height with images)
Image Overlay:   Dark overlay, text at bottom
Hover Effect:    scale-105 (5% zoom)
Text Positioning: bottom-6 left-6 (text overlay)
Text Style:      text-white, text-2xl font-bold
Gap:             gap-6 (24px)
```

### Spotlight Section
```
Grid:            2 cols (mobile), 3 cols (tablet), 4 cols (desktop)
Aspect Ratio:    3:4 (product cards)
Background:      White (#FFFFFF)
Title:           text-4xl md:text-5xl, centered, bold
Subtitle:        text-gray-600, centered, text-lg
Padding:         py-20 md:py-32 (section), mb-16 (title area)
Max Width:       max-w-7xl
```

## Breakpoints

```
Mobile:   0px → 640px (sm)
Tablet:   640px → 1024px (md)
Desktop:  1024px → 1280px (lg)
Large:    1280px+ (xl)
```

### Responsive Behavior
- **Mobile**: Single column, max-width container, full padding
- **Tablet**: 2-3 columns, balanced spacing
- **Desktop**: 3-4 columns, premium spacing, max-width 1280px/1400px

## Interaction States

### Buttons
```
Default:  bg-white/black, border-none
Hover:    Slightly darker shade (0.05 opacity increase)
Active:   scale-95 (press feedback)
Focus:    ring-2 ring-white ring-offset-2
Disabled: opacity-50, cursor-not-allowed
```

### Links
```
Default:  text-gray-400 (footer), text-black (body)
Hover:    text-white (footer), text-gray-600 (body), opacity-70
Focus:    ring-2 ring-offset-2
```

### Form Inputs
```
Border:    border-gray-700 (dark mode)
Focus:     border-white (light mode: border-black)
Background: bg-gray-900 (dark), white (light)
Text:      text-white (dark), text-black (light)
```

## Animations & Transitions

### Durations
```
Fast:    150ms (icon animations, opacity)
Normal:  300ms (hover effects, state changes)
Slow:    500ms (image zoom, slide transitions)
XSlow:   700ms (page transitions)
```

### Easing
```
ease-in-out: Default for most animations
ease-out:    For entrance animations
ease-in:     For exit animations
linear:      For consistent rotations/spins
```

### Common Transitions
```
Opacity:      transition-opacity duration-300
Transform:    transition-transform duration-500 ease-out
Color:        transition-colors duration-300
Background:   transition-colors duration-300
All:          transition-all duration-300
```

## Focus & Accessibility

### Focus Indicators
```
Global Rule: All interactive elements get:
  focus:outline-none
  focus:ring-2
  focus:ring-brand-primary
  focus:ring-offset-2

On Dark (Black Footer):
  ring-white
  ring-offset-black
```

### ARIA Attributes
```
Forms:       aria-required="true" for required fields
Navigation:  aria-label for icon buttons
Live:        aria-live="polite" for notifications
Hidden:      aria-hidden="true" for decorative elements
```

### Keyboard Navigation
- Tab order: Natural flow (top to bottom, left to right)
- Skip links: Hidden but available (sr-only)
- Modals: Focus trap within modal
- Menus: Arrow keys for navigation

## Mobile-First Approach

### Design Principles
1. Start with mobile layout (single column)
2. Progressive enhancement for larger screens
3. Touch-friendly targets (min 44px × 44px)
4. Thumb-reachable zones for primary actions
5. Readable font sizes (16px minimum)

### Mobile Specifics
- Burger menu replaces horizontal nav
- Single column product grids
- Full-width hero sections
- Stacked footer columns
- Larger tap targets (buttons, links)
- Simplified forms (fewer fields)

## File Organization

### Component Styles
- Inline Tailwind classes (no CSS files)
- Dark mode using Tailwind dark mode
- Responsive prefixes: sm:, md:, lg:, xl:
- Custom utilities in globals.css

### CSS Files
```
app/globals.css:       Global utilities, focus rings, scrollbar-hide
tailwind.config.ts:    Theme colors, animations, spacing
                       
(No component-level CSS files - all Tailwind)
```

## Performance Optimization

### Image Optimization
```
Format:       WebP with fallback to JPEG/PNG
Sizes:        Multiple breakpoints
Lazy Loading: Enabled for below-fold images
Aspect Ratio: Preserved to prevent layout shift
```

### Critical Performance Metrics
```
Largest Contentful Paint (LCP):    < 2.5s
First Input Delay (FID):            < 100ms
Cumulative Layout Shift (CLS):      < 0.1
```

## Versioning & Maintenance

### Version History
- **v1.0**: Nike.com redesign complete
  - Header, hero, featured categories
  - Spotlight section, minimalist cards
  - Nike-style footer
  - Black + white + gray color scheme

### Future Considerations
- Component library documentation
- Design system tokens file
- Figma design handoff
- Brand guideline documentation

---

**Last Updated**: January 2025
**Design System Version**: 1.0
**Compliance**: WCAG AA, Mobile-First, Performance-Optimized
