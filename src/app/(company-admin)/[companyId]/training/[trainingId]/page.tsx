"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useTraining } from "@/lib/hooks/useTraining"
import { Loading } from "@/components/ui/loading"
import { TrainingTabs } from "./components/training-tabs"
import { Overview } from "./components/overview"

export default function TrainingDetail() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'audience' | 'curriculum' | 'module'>('overview')
  const { data: training, isLoading } = useTraining(params.trainingId as string)

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="w-[calc(100%-85px)] pl-[85px] mx-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">{training?.title}</h1>
          <button className="p-2">
            <img src="/bell.svg" alt="Notifications" className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <TrainingTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {activeTab === 'overview' && training && (
          <Overview training={training} />
        )}
      </div>
    </div>
  )
}
