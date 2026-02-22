import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-yellow-400 text-black hover:bg-yellow-300 font-bold",
        secondary:
          "border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "text-zinc-200 border-zinc-700",
        yellowOutline: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
