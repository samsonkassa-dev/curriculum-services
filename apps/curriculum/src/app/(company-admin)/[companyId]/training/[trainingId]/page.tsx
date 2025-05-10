"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useTraining } from "@/lib/hooks/useTraining"
import { Loading } from "@/components/ui/loading"
import { TrainingTabs } from "./components/training-tabs"
import { Overview } from "./components/overview"
import { toast } from "sonner"
import { TrainingNotFound } from "./components/training-not-found"
import { TrainingProfile } from "./components/trainingProfile"
import { AudienceProfile } from "./components/audienceProfile"
import { ModuleComponent } from "./components/module"
import { EvaluationComponent } from "./components/evaluation"
import { StudentsComponent } from "./components/students"
import { SessionsComponent } from "./components/sessions"
import { AttendanceComponent } from "./components/attendance"
import { CertificateComponent } from "./components/certificate"
import { useUserRole } from "@/lib/hooks/useUserRole"

type TabType = 'overview' | 'profile' | 'audience' | 'module' | 'evaluation' | 'students' | 'sessions' | 'attendance' | 'certificate'

export default function TrainingDetail() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const trainingId = params.trainingId as string
  const companyId = params.companyId as string
  const { isTrainer } = useUserRole()
  
  // Get tab from URL query or default to 'overview'
  const tabParam = searchParams.get('tab')
  const validTabs: TabType[] = ['overview', 'profile', 'audience', 'module', 'evaluation', 'students', 'sessions', 'attendance', 'certificate']
  const initialTab: TabType = validTabs.includes(tabParam as TabType) ? (tabParam as TabType) : 'overview'
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  
  // Update the URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    
    // Create new URLSearchParams object from current params
    const newParams = new URLSearchParams(searchParams)
    
    // Set the tab parameter
    newParams.set('tab', tab)
    
    // Update the URL without reloading the page
    router.replace(`/${companyId}/training/${trainingId}?${newParams.toString()}`, { scroll: false })
  }
  
  const { data: training, isLoading, error } = useTraining(trainingId)

  useEffect(() => {
    if (error) {
      toast.error("Failed to load training", {
        description: "Please try again later"
      })
    }
  }, [error])

  if (isLoading) {
    return <Loading />
  }

  // Special UI for trainers when no training is assigned
  // if (!training && isTrainer) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[70vh] px-4">
  //       <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
  //         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
  //           <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"></path>
  //           <path d="M12 13v8"></path>
  //           <path d="M12 3v3"></path>
  //         </svg>
  //       </div>
  //       <h2 className="text-2xl font-bold text-gray-800 mb-3">No Training Assigned Yet</h2>
  //       <p className="text-gray-500 text-center max-w-md mb-6">
  //         You haven&apos;t been assigned to any training sessions at the moment. 
  //         Once assigned, your training content will appear here.
  //       </p>
  //       <div className="text-sm text-brand">
  //         Please remain patient or contact your administrator for more information.
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div>
      <TrainingTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="">
        {!training ? (
          <TrainingNotFound type={activeTab} />
        ) : (
          <>
            {activeTab === 'overview' && <Overview training={training} />}
            {activeTab === 'profile' && <TrainingProfile trainingId={training.id} />}
            {activeTab === 'audience' && <AudienceProfile trainingId={training.id}  />}
            {activeTab === 'module' && <ModuleComponent trainingId={training.id} />}
            {activeTab === 'evaluation' && <EvaluationComponent trainingId={training.id} />}
            {activeTab === 'students' && <StudentsComponent trainingId={training.id} />}
            {activeTab === 'sessions' && <SessionsComponent trainingId={training.id} />}
            {activeTab === 'attendance' && <AttendanceComponent trainingId={training.id} />}
            {activeTab === 'certificate' && <CertificateComponent trainingId={training.id} />}
          </>
        )}
      </div>
    </div>
  )
}
