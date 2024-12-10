import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        approved: "bg-green-50 text-green-700 ring-green-600/20",
        declined: "bg-red-50 text-red-700 ring-red-600/20",
        pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/10",
        active: "bg-green-50 text-green-700 ring-green-600/20",
        deactivated: "bg-red-50 text-red-700 ring-red-600/20",
      }
    },
    defaultVariants: {
      variant: "approved"
    }
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
