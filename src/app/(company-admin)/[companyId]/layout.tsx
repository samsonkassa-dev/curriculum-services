'use client'

import { useVerificationStatus } from "@/lib/hooks/useVerificationStatus"
import { toast } from "sonner"
import Sidebar from "@/components/ui/sidebar"
import Topbar from "@/components/ui/topbar"
import { VerificationStatus } from './components/verification-status'
import { Loading } from "@/components/ui/loading"
import { use } from 'react'
import { usePathname, useParams } from 'next/navigation'

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

// Add middleware to fetch requests to include company info
const addCompanyInfoToRequest = () => {
  const companyInfo = localStorage.getItem('company_info');
  if (companyInfo) {
    const requestInit = {
      headers: {
        'x-company-info': companyInfo
      }
    };
    return requestInit;
  }
  return {};
};

export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const { data: verificationData, isLoading } = useVerificationStatus()
  
  // More precise way to check specific routes
  const isSpecialRoute = () => {
    // First get the route pattern by removing companyId
    let routePattern = pathname.replace(params.companyId as string, '[companyId]')
    
    // Then replace the trainingId if it exists (for training detail pages)
    if (params.trainingId) {
      routePattern = routePattern.replace(params.trainingId as string, '[trainingId]')
    }
    
    // List of routes that should hide default layout
    const specialRoutes = [
      '/[companyId]/training/create-training',
      '/[companyId]/training/[trainingId]'
    ]
    
    return specialRoutes.some(route => routePattern === route)
  }

  const hideDefaultLayout = isSpecialRoute()

  // Create nav items with the actual companyId
  const navItemsWithCompanyId = adminNavItems.map(item => ({
    ...item,
    href: item.href.replace('[companyId]', params.companyId as string)
  }))

  const handleNavigation = (e: React.MouseEvent<HTMLElement>) => {
    // Get the clicked link's href
    const target = e.currentTarget as HTMLAnchorElement;
    const href = target.getAttribute('href') || '';

    // Allow access to training routes
    if (href.includes('/training')) return;

    if (verificationData?.verificationStatus === 'PENDING') {
      e.preventDefault()
      toast.error("Account not verified", {
        description: "Your account is pending verification"
      })
    } else if (verificationData?.verificationStatus === 'REJECTED') {
      e.preventDefault()
      toast.error("Account not verified", {
        description: verificationData.rejectionReason || "Your account was rejected"
      })
    }
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="opacity-100 transition-opacity duration-300">
      {!hideDefaultLayout && (
        <>
          <Sidebar 
            navItems={navItemsWithCompanyId} 
            onClick={(e: React.MouseEvent<Element>) => handleNavigation(e as React.MouseEvent<HTMLElement>)}
            disabled={verificationData?.verificationStatus !== 'ACCEPTED'}
          />
          <Topbar />
        </>
      )}
      
      {/* Allow training routes regardless of verification status */}
      {pathname.includes('/training') ? (
        children
      ) : (
        !verificationData || verificationData.verificationStatus !== 'ACCEPTED' ? (
          <VerificationStatus 
            status={verificationData?.verificationStatus || 'PENDING'}
            rejectionReason={verificationData?.rejectionReason || ''}
          />
        ) : (
          children
        )
      )}
    </div>
  )
}
