import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-slate-300 hover:-translate-y-0.5 active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-slate-50 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 dark:bg-slate-50 dark:text-slate-900 dark:shadow-slate-50/20 dark:hover:shadow-slate-50/30",
        destructive:
          "bg-red-500 text-slate-50 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 dark:bg-red-900 dark:text-slate-50",
        outline:
          "border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800",
        secondary:
          "bg-slate-100 text-slate-900 shadow-md shadow-slate-100/50 hover:shadow-lg hover:shadow-slate-100/70 dark:bg-slate-800 dark:text-slate-50 dark:shadow-slate-800/50 dark:hover:shadow-slate-800/70",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800",
        link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
        glass: "bg-white/20 dark:bg-slate-900/30 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-glass-md hover:bg-white/30 dark:hover:bg-slate-800/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
