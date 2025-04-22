"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { ModuleTabs } from "./components/module-tabs"
import { ModuleInformation } from "./components/module-information"
import { Content } from "./components/content"
import { AssessmentMethod } from "./components/assesment-method"
import Link from "next/link"
import { useTraining } from "@/lib/hooks/useTraining"
import { useModules } from "@/lib/hooks/useModule"
import { Loading } from "@/components/ui/loading"

export default function ModuleDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const trainingId = params.trainingId as string
  const moduleId = params.moduleId as string
  const companyId = params.companyId as string
  
  // Get tab from URL query or default to 'information'
  const [activeTab, setActiveTab] = useState<'information'  | 'content' | 'assessment-method'>(
    tabParam === 'assessment-method' ? 'assessment-method' : 'information'
  )

  // Fetch training and module data for breadcrumb
  const { data: training, isLoading: trainingLoading } = useTraining(trainingId)
  const { data: moduleDetails, isLoading: moduleLoading } = useModules(moduleId)

  // Update activeTab when URL changes
  useEffect(() => {
    if (tabParam === 'assessment-method') {
      setActiveTab('assessment-method')
    }
  }, [tabParam])

  if (trainingLoading || moduleLoading) {
    return <Loading />
  }

  const currentModule = moduleDetails?.module
  const parentModule = currentModule?.parentModule

  return (
    <div className="">
      {/* Breadcrumb */}
      <div className="px-[7%] pt-7 text-sm flex items-center flex-wrap">
        <Link 
          href={`/${companyId}/training/${trainingId}`} 
          className="text-gray-600 hover:text-brand transition-colors font-medium"
        >
          {training?.title || 'Training'}
        </Link>
        
        <span className="mx-2 text-gray-400 font-bold text-lg leading-none">•</span>
        
        {parentModule && (
          <>
            <Link 
              href={`/${companyId}/training/${trainingId}/${parentModule.id}`}
              className="text-gray-600 hover:text-brand transition-colors font-medium"
            >
              {parentModule.name}
            </Link>
            <span className="mx-2 text-gray-400 font-bold text-lg leading-none">•</span>
          </>
        )}
        
        <span className="font-semibold text-gray-800">
          {currentModule?.name || 'Module'}
        </span>
      </div>

      {/* Module Content */}
      <ModuleTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div>
        {activeTab === 'information' && <ModuleInformation moduleId={moduleId} />}
        {activeTab === 'content' && <Content/>}
        {activeTab === 'assessment-method' && <AssessmentMethod moduleId={moduleId} />}
      </div>
    </div>
  )
}
