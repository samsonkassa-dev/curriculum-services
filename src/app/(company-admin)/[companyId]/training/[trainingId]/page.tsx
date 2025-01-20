"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTraining } from "@/lib/hooks/useTraining"
import { Loading } from "@/components/ui/loading"
import { TrainingTabs } from "./components/training-tabs"
import { Overview } from "./components/overview"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { TrainingNotFound } from "./components/training-not-found"
import { TrainingProfile } from "./components/trainingProfile"
import { AudienceProfile } from "./components/audienceProfile"
import { Curriculum } from "./components/curriculum"

export default function TrainingDetail() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'audience' | 'curriculum' | 'module'>('overview')
  const { data: training, isLoading, error } = useTraining(params.trainingId as string)

  useEffect(() => {
    if (error) {
      toast.error("Failed to load training", {
        description: "Please try again later"
      })
      // Optionally navigate back after error
      // router.push(`/${params.companyId}/training`)
    }
  }, [error, params.companyId])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      {/* New Topbar */}
      <div className="bg-white md:px-8 px-4 py-6 flex items-center justify-between border-b-[0.5px] border-[#CED4DA]">
        <div className="flex items-center gap-4">
          <Link 
            href={`/${params.companyId}/training`}
            className="text-brand hover:text-brand-dark font-semibold text-lg flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
            <span className="text-xs md:text-lg">Back to Trainings</span>
          </Link>
          <h1 className="text-xs font-normal md:text-base">{training?.title || 'Training'}</h1>
        </div>
        <button 
          className="p-2 hover:bg-gray-50 rounded-full"
          title="Settings"
          aria-label="Settings"
        >
          <img src="/settingsTop.svg" alt="Settings" className="w-5 h-5" />
        </button>
      </div>

      <div>
        {/* Tabs */}
        <TrainingTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        <div className="">
          {/* Show content or not found based on training data existence */}
          {!training ? (
            <TrainingNotFound type={activeTab} />
          ) : (
            <>
              {activeTab === 'overview' && <Overview training={training} />}
              {activeTab === 'profile' && <TrainingProfile trainingId={training.id} />}
              {activeTab === 'audience' && <AudienceProfile trainingId={training.id}  />}
              {activeTab === 'curriculum' && <Curriculum trainingId={training.id} />}
              {activeTab === 'module' && <TrainingNotFound type="module" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
