import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
    	extend: {
    		colors: {
    			brand: {
    				primary: '#8B5E3C',
    				accent: '#D4A373',
    				cream: '#FCF8F3',
    				dark: '#1A1A1A'
    			},
    			neutral: {
    				'50': '#FCF8F3',
    				'100': '#EEE7DD',
    				'200': '#E4DBC9',
    				'300': '#CFC6B8',
    				'400': '#B7AC9A',
    				'500': '#736A5E',
    				'600': '#5A5349',
    				'700': '#544D43',
    				'800': '#3C372F',
    				'900': '#29241F'
    			},
    			darkbg: '#0f0f0f',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		fontFamily: {
    			sans: [
    				'var(--font-helvetica)',
    				'Helvetica Neue',
    				'Helvetica',
    				'Arial',
    				'sans-serif'
    			],
    			display: [
    				'Playfair Display',
    				'serif'
    			],
    			'geist-sans': ['var(--font-geist-sans)', 'Satoshi', 'system-ui', 'sans-serif'],
    			'geist-mono': ['var(--font-geist-mono)', 'ui-monospace', 'monospace']
    		},
    		animation: {
    			'fade-in': 'fadeIn 0.5s ease-in-out',
    			'slide-up': 'slideUp 0.6s ease-out'
    		},
    		keyframes: {
    			fadeIn: {
    				'0%': {
    					opacity: '0'
    				},
    				'100%': {
    					opacity: '1'
    				}
    			},
    			slideUp: {
    				'0%': {
    					transform: 'translateY(20px)',
    					opacity: '0'
    				},
    				'100%': {
    					transform: 'translateY(0)',
    					opacity: '1'
    				}
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		backdropBlur: {
    			xs: '2px',
    			sm: '4px',
    			md: '8px',
    			lg: '12px',
    			xl: '16px',
    			'2xl': '24px'
    		},
    		boxShadow: {
    			'glass-sm': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    			'glass-md': '0 8px 32px 0 rgba(31, 38, 135, 0.45)',
    			'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.55)',
    			'glass-xl': '0 8px 32px 0 rgba(31, 38, 135, 0.65)'
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
}
export default config
