"use client";

import { useState, useEffect } from "react";
import { useVerificationStatus } from "@/lib/hooks/useVerificationStatus";
import { toast } from "sonner";
import Sidebar from "@/components/ui/sidebar";
import Topbar from "@/components/ui/topbar";
import { VerificationStatus } from "./components/verification-status";
import { Loading } from "@/components/ui/loading";
import { usePathname, useParams } from "next/navigation";

interface NavItem {
  icon: JSX.Element;
  href: string;
  label: string;
}

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
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  
  // Only fetch verification status for company admin
  const isCompanyAdmin = userRole === "ROLE_COMPANY_ADMIN";
  
  const { data: verificationData, isLoading: verificationLoading } = useVerificationStatus({
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
    
    if (userRole === "ROLE_CURRICULUM_ADMIN" || userRole === "ROLE_CONTENT_DEVELOPER") {
      // For curriculum roles, use their role as the companyId
      const roleForUrl = userRole.toLowerCase().replace('role_', '').replace('_', '-');
      setNavItems([
        {
          icon: <img src="/home.svg" alt="icon" width={19} height={19} />,
          href: `/${roleForUrl}/dashboard`,
          label: "Dashboard",
        },
        {
          icon: <img src="/training.svg" alt="icon" width={19} height={19} />,
          href: `/${roleForUrl}/training`,
          label: "Training",
        },
        {
          icon: <img src="/settings.svg" alt="icon" width={19} height={19} />,
          href: `/${roleForUrl}/settings`,
          label: "Settings",
        },
      ]);
    } else if (userRole === "ROLE_COMPANY_ADMIN") {
      setNavItems([
        {
          icon: <img src="/home.svg" alt="icon" width={19} height={19} />,
          href: `/${params.companyId}/dashboard`,
          label: "Dashboard",
        },
        {
          icon: <img src="/company-dash.svg" alt="icon" width={17} height={17} />,
          href: `/${params.companyId}/company`,
          label: "My Company",
        },
        {
          icon: <img src="/users.svg" alt="icon" width={19} height={19} />,
          href: `/${params.companyId}/training`,
          label: "Training",
        },
        {
          icon: <img src="/archive.svg" alt="icon" width={19} height={19} />,
          href: `/${params.companyId}/archive`,
          label: "Archive",
        },
        {
          icon: <img src="/profile.svg" alt="icon" width={19} height={19} />,
          href: `/${params.companyId}/users`,
          label: "Users",
        },
        {
          icon: <img src="/settings.svg" alt="icon" width={19} height={19} />,
          href: `/${params.companyId}/settings`,
          label: "Settings",
        },
      ]);
    }
  }, [isClientReady, userRole, params.companyId]);

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
  if (isCompanyAdmin && verificationLoading) {
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
