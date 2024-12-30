'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Button } from "./button"
import { useRouter } from "next/navigation"
import { decodeJWT } from "@/lib/utils"
import { useVerificationStatus } from "@/lib/hooks/useVerificationStatus"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUserProfile } from "@/lib/hooks/useUserProfile"
import { clearAuthData } from "@/lib/utils/auth"
import { useEffect, useState } from 'react'

export default function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Check roles from token first
  const isIcogAdmin = () => {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('auth_token')
    if (!token) return false
    
    const decoded = decodeJWT(token)
    return decoded?.role === 'ROLE_ICOG_ADMIN'
  }

  const isCompanyAdmin = () => {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('auth_token')
    if (!token) return false
    
    const decoded = decodeJWT(token)
    return decoded?.role === 'ROLE_COMPANY_ADMIN'
  }

  const isCompanyAdminRole = mounted && isCompanyAdmin()

  // Hooks before any conditional returns
  const { data: user } = useUserProfile({
    enabled: isCompanyAdminRole
  })
  const { data: verificationData } = useVerificationStatus({
    enabled: isCompanyAdminRole
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Convert pathname to title
  const getPageTitle = (path: string) => {
    const segment = path.split('/').pop() || ''
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  const handleCreateTraining = () => {
    if (isCompanyAdminRole && verificationData?.verificationStatus !== 'ACCEPTED') {
      toast.error("Account not verified", {
        description: "Your account is pending verification"
      })
      return
    }
    toast.warning("UI is not avalilable for now", {
      // description: "Please wait for your account to be verified"
    })
  }

  const handleLogout = () => {
    clearAuthData()
  }

  return (
    <div className="ml-[65px] flex items-center justify-between px-8 py-6 bg-white border-b-[0.3px] border-[#CED4DA]">
      <div className="flex items-center justify-between w-full">
        {/* Page Title */}
        <h1 className="text-2xl pl-[59px] font-semibold">
          {getPageTitle(pathname)}
        </h1>

        <div className="flex items-center gap-6">
          {/* Create Training Button */}
          {isCompanyAdmin() && (
            <Button
              onClick={handleCreateTraining}
              className="bg-[#0B75FF] hover:bg-[#0052CC] text-white px-6 py-5 rounded-3xl"
            >
              Create Training
            </Button>
          )}

          {/* Right Side Icons */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button 
              className="p-3 rounded-full bg-brand-opacity transition-colors"
              aria-label="Notifications"
              title="Notifications"
            >
              <div className="relative">
                <Image  
                  src="/bell.svg"
                  alt="Notifications"
                  width={14}
                  height={14}
                />
              </div>
            </button>

            {/* Profile Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="p-3 rounded-full overflow-hidden border border-gray-200"
                  aria-label="Open profile menu"
                  title="Profile menu"
                >
                  <Image
                    src="/profile.svg"
                    alt="Profile"
                    width={15}
                    height={15}
                    className="object-cover"
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 mr-6" align="end">
                <div className="p-6 space-y-4">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                      <Image
                        src="/profile.svg"
                        alt="Profile"
                        width={30}
                        height={30}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-md">
                        {isIcogAdmin() ? 'iCog Admin' : `${user?.firstName} ${user?.lastName}`}
                      </h3>
                      <p className="text-[#8C8C8C] font-normal text-sm">
                        {isIcogAdmin() ? 'ICOG ADMIN' : user?.role.name.replace('ROLE_', '')}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2 pt-4">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md">
                      Edit Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md">
                      Help and Support
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md text-red-500"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
}
