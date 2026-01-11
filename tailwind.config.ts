import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'media', // Disable dark mode - light theme only
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Brand palette inspired by sankofa-tribe.catlog.shop
                brand: {
                    primary: '#8B5E3C', // warm brown
                    accent: '#D4A373', // golden tan
                    cream: '#FCF8F3', // light cream background
                    dark: '#1A1A1A', // near-black text
                },
                neutral: {
                    50: '#FCF8F3',
                    100: '#EEE7DD',
                    200: '#E4DBC9',
                    300: '#CFC6B8',
                    400: '#B7AC9A',
                        500: '#736A5E', // Improved contrast
                        600: '#5A5349', // Darker for better WCAG compliance
                    700: '#544D43',
                    800: '#3C372F',
                    900: '#29241F',
                },
                darkbg: '#0f0f0f',
            },
            fontFamily: {
                sans: ['var(--font-helvetica)', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
                display: ['Playfair Display', 'serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.6s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
export default config
