"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { ModuleTabs } from "./components/module-tabs"
import { ModuleInformation } from "./components/module-information"
import { Content } from "./components/content"
import { AssessmentMethod } from "./components/assesment-method"
// import Link from "next/link"

export default function ModuleDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  
  const [activeTab, setActiveTab] = useState<'information'  | 'content' | 'assessment-method'>(
    tabParam === 'assessment-method' ? 'assessment-method' : 'information'
  )

  // Update activeTab when URL changes
  useEffect(() => {
    if (tabParam === 'assessment-method') {
      setActiveTab('assessment-method')
    }
  }, [tabParam])

  return (
    <div className="">
      <ModuleTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div>
        {activeTab === 'information' && <ModuleInformation moduleId={params.moduleId as string} />}
        {activeTab === 'content' && <Content/>}
        {activeTab === 'assessment-method' && <AssessmentMethod sectionId={params.moduleId as string} />}
      </div>
    </div>
  )
}
