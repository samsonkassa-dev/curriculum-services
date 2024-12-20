import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
}

export function Loading({ className }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-screen bg-white", className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* Loading spinner */}
        <div className="w-10 h-10 border-4 border-[#0B75FF] border-t-transparent rounded-full animate-spin" />
        
        {/* Loading text */}
        <p className="text-sm text-[#8C8C8C] animate-pulse">
          Loading
        </p>
      </div>
    </div>
  )
} 