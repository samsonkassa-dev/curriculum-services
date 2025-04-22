"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface GenderSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showPercentage?: boolean
}

const GenderSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  GenderSliderProps
>(({ className, showPercentage = true, ...props }, ref) => {
  // Get the current value for positioning the icon
  const value = props.value?.[0] || 0
  
  return (
    <div className="space-y-4">
      <div className="relative ">
        <div className="flex justify-between w-full mb-3">
          <div className="flex items-center">
            <Image
              src="/male.svg"
              alt="Male"
              width={16}
              height={16}
              className="mr-1"
            />
            <span className="text-sm">Male</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm">Female</span>
            <Image
              src="/female.svg"
              alt="Female"
              width={16}
              height={16}
              className="ml-1"
            />
          </div>
        </div>
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
          )}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-[#D9D9D9]">
            <SliderPrimitive.Range className="absolute h-full bg-brand" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-brand bg-white relative ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-brand"></div>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>
      <div className="flex items-center space-x-4 px-2">
        {showPercentage && (
          <div className="flex justify-between w-full">
            <span className="text-sm font-medium">Male: {value}%</span>
            <span className="text-sm font-medium">Female: {100 - value}%</span>
          </div>
        )}
      </div>
    </div>
  );
})

GenderSlider.displayName = "GenderSlider"

export { GenderSlider } 