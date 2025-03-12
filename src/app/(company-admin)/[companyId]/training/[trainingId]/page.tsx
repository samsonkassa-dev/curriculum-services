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

type TabType = 'overview' | 'profile' | 'audience' | 'module'

export default function TrainingDetail() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const trainingId = params.trainingId as string
  const companyId = params.companyId as string
  
  // Get tab from URL query or default to 'overview'
  const tabParam = searchParams.get('tab')
  const validTabs: TabType[] = ['overview', 'profile', 'audience', 'module']
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
            {/* {activeTab === 'curriculum' && <Curriculum trainingId={training.id} />} */}
            {activeTab === 'module' && <ModuleComponent trainingId={training.id} />}
          </>
        )}
      </div>
    </div>
  )
}
