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
    <div className="">


      <ModuleTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div>
        {activeTab === 'information' && <ModuleInformation moduleId={params.moduleId as string} />}
        {activeTab === 'section' && <Section moduleId={params.moduleId as string} />}
        {activeTab === 'content' && <Content/>}
      </div>
    </div>
  )
}
