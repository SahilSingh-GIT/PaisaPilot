import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

const Button = React.forwardRef(({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  
  // Minimal manual variant mapping (shadcn-like without full cva for simplicity)
  let baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400 disabled:pointer-events-none disabled:opacity-50"
  
  let variantStyles = ""
  switch (variant) {
    case "default":
      variantStyles = "bg-zinc-50 text-zinc-900 shadow hover:bg-zinc-50/90"
      break
    case "destructive":
      variantStyles = "bg-red-500 text-zinc-50 shadow-sm hover:bg-red-500/90"
      break
    case "outline":
      variantStyles = "border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      break
    case "secondary":
      variantStyles = "bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80"
      break
    case "ghost":
      variantStyles = "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      break
    case "link":
      variantStyles = "text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
      break
  }

  let sizeStyles = ""
  switch (size) {
    case "default":
      sizeStyles = "h-9 px-4 py-2"
      break
    case "sm":
      sizeStyles = "h-8 rounded-md px-3 text-xs"
      break
    case "lg":
      sizeStyles = "h-10 rounded-md px-8"
      break
    case "icon":
      sizeStyles = "h-9 w-9"
      break
  }

  return (
    <Comp
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
