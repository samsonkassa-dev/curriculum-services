"use client";

import { useState, useEffect } from "react";
import { useVerificationStatus } from "@/lib/hooks/useVerificationStatus";
import { toast } from "sonner";
import Sidebar from "@/components/ui/sidebar";
import Topbar from "@/components/ui/topbar";
import { VerificationStatus } from "./components/verification-status";
import { Loading } from "@/components/ui/loading";
import { usePathname, useParams } from "next/navigation";

const curriculumNavItems = [
  {
    icon: <img src="/home.svg" alt="icon" width={19} height={19} />,
    href: "/[role]/dashboard",
    label: "Dashboard",
  },
  {
    icon: <img src="/training.svg" alt="icon" width={19} height={19} />,
    href: "/[role]/training",
    label: "Training",
  },
  {
    icon: <img src="/settings.svg" alt="icon" width={19} height={19} />,
    href: "/[role]/settings",
    label: "Settings",
  },
];

const adminNavItems = [
  {
    icon: <img src="/home.svg" alt="icon" width={19} height={19} />,
    href: "/[companyId]/dashboard",
    label: "Dashboard",
  },

  {
    icon: <img src="/company-dash.svg" alt="icon" width={17} height={17} />,
    href: "/[companyId]/company",
    label: "My Company",
  },
  {
    icon: <img src="/users.svg" alt="icon" width={19} height={19} />,
    href: "/[companyId]/training",
    label: "Training",
  },
  {
    icon: <img src="/archive.svg" alt="icon" width={19} height={19} />,
    href: "/[companyId]/archive",
    label: "Archive",
  },
  {
    icon: <img src="/profile.svg" alt="icon" width={19} height={19} />,
    href: "/[companyId]/users",
    label: "Users",
  },
  {
    icon: <img src="/settings.svg" alt="icon" width={19} height={19} />,
    href: "/[companyId]/settings",
    label: "Settings",
  },
];


export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const [isCurriculumRole, setIsCurriculumRole] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [navItems, setNavItems] = useState(adminNavItems);
  
  // Only fetch verification status for company admin
  const isCompanyAdmin = userRole === "ROLE_COMPANY_ADMIN";
  
  const { data: verificationData, isLoading } = useVerificationStatus({
    enabled: isCompanyAdmin && isClientReady // Only enable the query for company admin and when client is ready
  });
  
  useEffect(() => {
    // Safe to access localStorage inside useEffect
    const storedUserRole = typeof window !== 'undefined' ? localStorage.getItem("user_role") : null;
    setUserRole(storedUserRole);
    
    setIsCurriculumRole([
      'ROLE_SUB_CURRICULUM_ADMIN',
      'ROLE_CURRICULUM_ADMIN',
      'ROLE_CONTENT_DEVELOPER'
    ].includes(storedUserRole || ''));
    
    setIsClientReady(true);
  }, []);

  // Setup navigation items when client is ready and we have roles
  useEffect(() => {
    if (!isClientReady) return;
    
    // Create nav items with the actual route
    if (isCurriculumRole) {
      const roleForUrl = typeof window !== 'undefined' 
        ? localStorage.getItem("user_role")?.toLowerCase().replace('role_', '').replace('_', '-') || 'unauthorized'
        : 'unauthorized';
        
      setNavItems(curriculumNavItems.map(item => ({
        ...item,
        href: item.href.replace("[role]", roleForUrl),
      })));
    } else {
      setNavItems(adminNavItems.map(item => ({
        ...item,
        href: item.href.replace("[companyId]", params.companyId as string),
      })));
    }
  }, [isClientReady, isCurriculumRole, params.companyId]);

  // Special routes that hide the default layout
  const isSpecialRoute = () => {
    let routePattern = pathname.replace(params.companyId as string, "[companyId]");
    
    if (params.trainingId) {
      routePattern = routePattern.replace(params.trainingId as string, "[trainingId]");
    }
    
    if (params.moduleId) {
      routePattern = routePattern.replace(params.moduleId as string, '[moduleId]');
    }
    
    const specialRoutes = [
      '/[companyId]/training/create-training',
      '/[companyId]/training/[trainingId]',
      '/[companyId]/training/[trainingId]/users',
      '/[companyId]/training/[trainingId]/[moduleId]'
    ];
    
    return specialRoutes.some(route => routePattern === route);
  };

  const hideDefaultLayout = isSpecialRoute();

  const handleNavigation = (e: React.MouseEvent<HTMLElement>) => {
    // Only check verification for company admin
    if (isCompanyAdmin && verificationData?.verificationStatus !== "ACCEPTED") {
      e.preventDefault();
      toast.error("Account not verified", {
        description: verificationData?.verificationStatus === "REJECTED"
          ? verificationData.rejectionReason
          : "Your account is pending verification",
      });
    }
  };

  // Don't render anything until we've checked the role on the client
  if (!isClientReady) {
    return <Loading />;
  }

  // Only show loading for company admin verification check
  if (isCompanyAdmin && isLoading) {
    return <Loading />;
  }

  return (
    <div className="opacity-100 transition-opacity duration-300">
      {!hideDefaultLayout && (
        <>
          <Sidebar
            navItems={navItems}
            onClick={(e: React.MouseEvent<Element>) =>
              handleNavigation(e as React.MouseEvent<HTMLElement>)
            }
            disabled={isCompanyAdmin && verificationData?.verificationStatus !== "ACCEPTED"}
          />
          <Topbar />
        </>
      )}

      {/* Only show verification status for company admin */}
      {isCompanyAdmin && verificationData?.verificationStatus !== "ACCEPTED" ? (
        <VerificationStatus
          status={verificationData?.verificationStatus || "PENDING"}
          rejectionReason={verificationData?.rejectionReason || ""}
        />
      ) : (
        children
      )}
    </div>
  );
}
