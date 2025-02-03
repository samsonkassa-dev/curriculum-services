"use client";

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
    icon: <img src="/training.svg" alt="icon" width={19} height={19} />,
    href: "/[companyId]/training",
    label: "Training",
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

// Add middleware to fetch requests to include company info
// const addCompanyInfoToRequest = () => {
//   const companyInfo = localStorage.getItem("company_info");
//   if (companyInfo) {
//     const requestInit = {
//       headers: {
//         "x-company-info": companyInfo,
//       },
//     };
//     return requestInit;
//   }
//   return {};
// };

export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const { data: verificationData, isLoading } = useVerificationStatus();
  
  const userRole = localStorage.getItem("user_role");
  
  const isCurriculumRole = [
    'ROLE_SUB_CURRICULUM_ADMIN',
    'ROLE_CURRICULUM_ADMIN',
    'ROLE_CONTENT_DEVELOPER'
  ].includes(userRole || '');

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

  // Create nav items with the actual route
  const navItems = isCurriculumRole 
    ? curriculumNavItems.map(item => ({
        ...item,
        href: item.href.replace(
          "[role]", 
          (userRole || 'unauthorized')
            .toLowerCase()
            .replace('role_', '')
            .replace('_', '-')
        ),
      }))
    : adminNavItems.map(item => ({
        ...item,
        href: item.href.replace("[companyId]", params.companyId as string),
      }));

  const handleNavigation = (e: React.MouseEvent<HTMLElement>) => {
    // Only check verification for company admin role
    if (!isCurriculumRole && verificationData?.verificationStatus !== "ACCEPTED") {
      e.preventDefault();
      toast.error("Account not verified", {
        description: verificationData?.verificationStatus === "REJECTED"
          ? verificationData.rejectionReason
          : "Your account is pending verification",
      });
    }
  };

  if (isLoading && !isCurriculumRole) {
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
            disabled={!isCurriculumRole && verificationData?.verificationStatus !== "ACCEPTED"}
          />
          <Topbar />
        </>
      )}

      {isCurriculumRole ? (
        children
      ) : !verificationData || verificationData.verificationStatus !== "ACCEPTED" ? (
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
