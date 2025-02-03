import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        accepted: "bg-green-50 text-green-700 ring-green-600/20",
        pending: "bg-[#e7f2ff] text-black ring-[#e7f2ff]/10",
        rejected: "bg-red-50 text-red-700 ring-red-600/20",
        active: "bg-green-50 text-green-700 ring-green-600/20",
        deactivated: "bg-red-50 text-red-700 ring-red-600/20",
        deleted: "bg-red-50 text-red-700 ring-red-600/20",
        approved: "bg-green-50 text-green-700 ring-green-600/20",
      }
    },
    defaultVariants: {
      variant: "pending"
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
