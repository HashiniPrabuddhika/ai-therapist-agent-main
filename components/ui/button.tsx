import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Variant class mapping
    const variantClass = {
      default: "button-default",
      destructive: "button-destructive",
      outline: "button-outline",
      secondary: "button-secondary",
      ghost: "button-ghost",
      link: "button-link",
    }
    
    // Size class mapping
    const sizeClass = {
      default: "button-default-size",
      sm: "button-sm",
      lg: "button-lg",
      icon: "button-icon",
    }
    
    return (
      <Comp
        className={cn(
          "button-base",
          variantClass[variant],
          sizeClass[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }