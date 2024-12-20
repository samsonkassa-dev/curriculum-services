'use client'

import { useVerificationStatus } from "@/lib/hooks/useVerificationStatus"
import { toast } from "sonner"
import Sidebar from "@/components/ui/sidebar"
import Topbar from "@/components/ui/topbar"
import { VerificationStatus } from './components/verification-status'
import { Loading } from "@/components/ui/loading"
import { use } from 'react'

const adminNavItems = [
  {
    icon: (
      <img src="/home.svg" alt="icon" width={19} height={19} />
    ),
    href: "/[companyId]/dashboard",
    label: "Dashboard"
  },

  {
    icon: (
      <img src="/company-dash.svg" alt="icon" width={17} height={17} />
    ),
    href: "/[companyId]/company",
    label: "My Company"
  },
  {
    icon: (
      <img src="/training.svg" alt="icon" width={19} height={19} />
    ),
    href: "/[companyId]/training",
    label: "Training"
  },
  {
    icon: (
      <img src="/profile.svg" alt="icon" width={19} height={19} />
    ),
    href: "/[companyId]/users",
    label: "Users"
  },
  {
    icon: (
      <img src="/settings.svg" alt="icon" width={19} height={19} />
    ),
    href: "/[companyId]/settings",
    label: "Settings"
  },
]

export default function CompanyAdminLayout({
  children,
  params: paramsPromise
}: {
  children: React.ReactNode
  params: Promise<{ companyId: string }>
}) {
  const { data: verificationData, isLoading } = useVerificationStatus()
  const params = use(paramsPromise)

  const navItemsWithCompanyId = adminNavItems.map(item => ({
    ...item,
    href: item.href.replace('[companyId]', params.companyId)
  }))

  const handleNavigation = (e: React.MouseEvent) => {
    if (!verificationData?.verificationStatus) return;

    if (verificationData.verificationStatus === 'PENDING') {
      e.preventDefault()
      toast.error("Account not verified", {
        description: "Your account is pending verification"
      })
    } else if (verificationData.verificationStatus === 'REJECTED') {
      e.preventDefault()
      toast.error("Account not verified", {
        description: verificationData.rejectionReason || "Your account was rejected"
      })
    }  else if (verificationData.verificationStatus === 'ACCEPTED') {
      e.preventDefault()
      toast.warning("UI is not avalilable for now", {
        // description: verificationData.rejectionReason || "Your account was rejected"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="opacity-100 transition-opacity duration-300">
      <Sidebar 
        navItems={navItemsWithCompanyId} 
        onClick={handleNavigation}
        disabled={verificationData?.verificationStatus !== 'ACCEPTED'}
      />
      <Topbar />
      
      {!verificationData || verificationData.verificationStatus !== 'ACCEPTED' ? (
        <VerificationStatus 
          status={verificationData?.verificationStatus || 'PENDING'}
          rejectionReason={verificationData?.rejectionReason || ''}
        />
      ) : (
        children
      )}
    </div>
  )
}
