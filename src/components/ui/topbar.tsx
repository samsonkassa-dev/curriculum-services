'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "./button"
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
import { EditProfileModal } from "@/components/modals/edit-profile-modal"
import { useProfilePicture } from "@/lib/hooks/useProfilePicture"

export default function Topbar() {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
    
  const decoded = typeof window !== 'undefined' ? decodeJWT(localStorage.getItem('auth_token') || '') : null
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

  const profilePicture = useProfilePicture()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Convert pathname to title
  const getPageTitle = (path: string) => {
    if (isIcogAdmin()) {
      // For ICOG admin, use first segment after /
      const segment = path.split('/')[1] || ''
      return segment.charAt(0).toUpperCase() + segment.slice(1)
    } else {
      // For other roles, use last segment
      const segment = path.split('/').pop() || ''
      return segment.charAt(0).toUpperCase() + segment.slice(1)
    }
  }

  const handleCreateTraining = () => {
    if (isCompanyAdminRole) {
      if (verificationData?.verificationStatus !== 'ACCEPTED') {
        toast.error("Account not verified", {
          description: "Your account is pending verification"
        })
        return
      }
      
      router.push(`/${params.companyId}/training/create-training`)
    }
  }

  const handleLogout = () => {
    clearAuthData()
  }

  // Add this helper function to transform role names
  const getDisplayRole = (role: string) => {
    // First try to get from user object
    if (role === 'ROLE_COMPANY_ADMIN') return 'Company Admin';
    if (role === 'ROLE_SUB_CURRICULUM_ADMIN') return 'Sub Curriculum Admin';
    if (role === 'ROLE_CURRICULUM_ADMIN') return 'Curriculum Admin';
    if (role === 'ROLE_CONTENT_DEVELOPER') return 'Content Developer';
    if (role === 'ROLE_ICOG_ADMIN') return 'iCog Admin';

    // Fallback to formatting the role string
    return role.toLowerCase()
      .replace('role_', '')
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="border-b-[0.3px] border-[#CED4DA]">
      <div className="lg:px-16 md:px-14 px-4 flex items-center justify-between py-6  bg-white">
        <div className="flex items-center justify-between w-full">
          {/* Page Title */}
          <h1 className=" md:text-lg text-sm pl-12 font-medium">
            {getPageTitle(pathname)}
          </h1>

          <div className="flex items-center md:gap-6 gap-3">
            {/* Create Training Button */}
            {isCompanyAdmin() && (
              <Button
                onClick={handleCreateTraining}
                className="bg-[#0B75FF] hover:bg-[#0052CC] text-white lg:px-6 lg:py-5 px-3 py-1 rounded-3xl md:text-sm text-xs"
              >
                Create Training
              </Button>
            )}

            {/* Right Side Icons */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button
                className="p-3 rounded-full bg-[#cee3ff] transition-colors"
                aria-label="Notifications"
                title="Notifications"
              >
                <div className="relative">
                  <Image
                    src="/bell.svg"
                    alt="Notifications"
                    width={12}
                    height={12}
                    className="lg:w-[14px] lg:h-[14px] w-[10px] h-[10px]"
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
                      src={profilePicture}
                      alt="Profile"
                      width={12}
                      height={12}
                      className="lg:w-[14px] lg:h-[14px] w-[10px] h-[10px] object-cover"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 mr-6" align="end">
                  <div className="space-y-4">
                    {/* Profile Header */}
                    <div className="px-6">
                      <div className="flex items-center gap-4 py-3">
                        <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                          <Image
                            src={profilePicture}
                            alt="Profile"
                            width={30}
                            height={30}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-md text-[#292827] break-words">
                            {isIcogAdmin()
                              ? "iCog Admin"
                              : isCompanyAdmin()
                                ? `${decoded?.firstName} ${decoded?.lastName}`
                                : decoded?.email}
                          </h3>
                          <p className="text-[#8C8C8C] font-normal text-sm break-words">
                            {isIcogAdmin()
                              ? "iCog Admin"
                              : getDisplayRole(decoded?.role || '')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-[#f2f2f2] border-[0.1px] " />

                    {/* Menu Items */}
                    <div className="space-y-1 px-6 pb-4">
                      <button 
                        className="w-full font-light text-sm text-left px-4 py-2 text-[#16151C] hover:bg-gray-50 rounded-md"
                        onClick={() => setIsEditProfileOpen(true)}
                      >
                        Edit Profile
                      </button>
                      {/* <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md te">
                        Help and Support
                      </button> */}

                      <hr className="border-[#f2f2f2] border-[0.1px] -mx-6" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md text-[#16151c] font-normal text-sm"
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
      
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
}
