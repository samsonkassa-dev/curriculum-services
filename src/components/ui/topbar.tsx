'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Topbar() {
  const pathname = usePathname()
  
  // Convert pathname to title (e.g., "/training" -> "Training")
  const getPageTitle = (path: string) => {
    const segment = path.split('/').pop() || ''
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  return (
    <div className=" ml-[65px] flex items-center justify-between px-8 py-6 bg-white border-b-[0.3px] border-[#CED4DA]">
      {/* Page Title */}
      <h1 className="text-2xl pl-[59px] font-semibold">
        {getPageTitle(pathname)}
      </h1>

      {/* Right Side Icons */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button 
          className="p-3 rounded-full bg-brand-opacity transition-colors"
          aria-label="Notifications"
        >
          <div className="relative">
            <Image  
              src="/bell.svg"
              alt="Notifications"
              width={14}
              height={14}
            />
            {/* Notification dot - show when there are notifications */}
            {/* <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
          </div>
        </button>

        {/* Profile Picture */}
        <button 
          className="p-3 rounded-full overflow-hidden border border-gray-200"
          aria-label="Profile"
        >
          <Image
            src="/profile.svg"
            alt="Profile picture"
            width={15}
            height={15}
            className="object-cover"
          />
        </button>
      </div>
    </div>
  )
}
