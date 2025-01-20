"use client"


import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showPasswordToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base border-[#CCCCCC] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
        {showPasswordToggle && type === "password" && (
          <button
            title="show password"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Image
              src="/solar_eye-broken.svg"
              alt={showPassword ? "Hide password" : "Show password"}
              width={24}
              height={24}
            />
          </button>
        )}
      </div>
    );
  }
)
Input.displayName = "Input"

export { Input }