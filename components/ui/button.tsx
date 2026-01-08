import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider',
    {
        variants: {
            variant: {
                default: 'bg-brand-primary text-white hover:bg-neutral-700 active:scale-95',
                secondary: 'bg-brand-cream text-brand-dark border border-brand-primary hover:bg-neutral-100 active:scale-95',
                outline: 'border-2 border-brand-primary text-brand-primary bg-transparent hover:bg-brand-primary hover:text-white active:scale-95',
                destructive: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
                ghost: 'hover:bg-neutral-100 hover:text-brand-dark',
                link: 'text-brand-dark underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-12 px-8 py-3',
                sm: 'h-9 px-4 text-xs',
                lg: 'h-14 px-10 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={`${buttonVariants({ variant, size })} ${className || ''}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
