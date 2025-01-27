"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTraining } from "@/lib/hooks/useTraining"
import { Loading } from "@/components/ui/loading"
import { TrainingTabs } from "./components/training-tabs"
import { Overview } from "./components/overview"
import { toast } from "sonner"
import { TrainingNotFound } from "./components/training-not-found"
import { TrainingProfile } from "./components/trainingProfile"
import { AudienceProfile } from "./components/audienceProfile"
import { Curriculum } from "./components/curriculum"
import { ModuleComponent } from "./components/module"

export default function TrainingDetail() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'audience' | 'curriculum' | 'module'>('overview')
  const { data: training, isLoading, error } = useTraining(params.trainingId as string)

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
      <TrainingTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="">
        {!training ? (
          <TrainingNotFound type={activeTab} />
        ) : (
          <>
            {activeTab === 'overview' && <Overview training={training} />}
            {activeTab === 'profile' && <TrainingProfile trainingId={training.id} />}
            {activeTab === 'audience' && <AudienceProfile trainingId={training.id}  />}
            {activeTab === 'curriculum' && <Curriculum trainingId={training.id} />}
            {activeTab === 'module' && <ModuleComponent trainingId={training.id} />}
          </>
        )}
      </div>
    </div>
  )
}
