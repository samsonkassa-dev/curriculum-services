"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ModuleTabs } from "./components/module-tabs"
import { ModuleInformation } from "./components/module-information"
import { Section } from "./components/section"
import { Content } from "./components/content"
// import { Section } from "./components/section"
// import { Content } from "./components/content"
// import Link from "next/link"

export default function ModuleDetail() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'information' | 'section' | 'content'>('information')

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="py-10">
        {/* <Link 
          href={`/${params.companyId}/training/${params.trainingId}`}
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
        >
          <img src="/back.svg" alt="back" className="w-4 h-4" />
          <span>Back to Module</span>
        </Link> */}
        {/* <h1 className="text-xl font-semibold mt-4">Module 1</h1> */}
      </div>

      <ModuleTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div>
        {activeTab === 'information' && <ModuleInformation moduleId={params.moduleId as string} />}
        {activeTab === 'section' && <Section moduleId={params.moduleId as string} />}
        {activeTab === 'content' && <Content/>}
      </div>
    </div>
  )
}
