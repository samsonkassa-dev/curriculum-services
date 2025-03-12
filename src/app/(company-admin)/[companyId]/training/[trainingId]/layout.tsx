"use client"

import { useParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, UserRoundCog } from "lucide-react"
import { useTraining } from "@/lib/hooks/useTraining"

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const { data: training } = useTraining(params.trainingId as string)
  const userRole = localStorage.getItem("user_role")
  const isCompanyAdmin = userRole === "ROLE_COMPANY_ADMIN"

  const handleSettingsClick = () => {
    router.push(`/${params.companyId}/training/${params.trainingId}/users`)
  }

  const isUsersPage = pathname.endsWith('/users')

  return (
    <div className="min-h-screen ">
      {/* Topbar */}
      <div className="bg-white md:px-8 px-4 py-6 flex items-center justify-between border-b-[0.5px] border-[#CED4DA]">
        <div className="flex items-center gap-4">
          <Link 
            href={`/${params.companyId}/training`}
            className="text-brand hover:text-brand-dark font-semibold text-lg flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
            <span className="text-xs md:text-lg">Back to Trainings</span>
          </Link>
          <h1 className="text-xs font-normal md:text-base">
            {isUsersPage ? 'Users' : training?.title || 'Training'}
          </h1>
        </div>
        {isCompanyAdmin && (
          <button 
            onClick={handleSettingsClick}
            className="p-3 hover:bg-brand-opacity rounded-full"
            title="Training Users"
            aria-label="Training Users"
          >
            <UserRoundCog className="w-7 h-7" />
          </button>
        )}
      </div>

      {children}
    </div>
  )
} 