"use client"

import { cn } from "@/lib/utils"
import { BaseDataType } from "@/types/base-data"

interface Tab {
  id: BaseDataType
  name: string
}

// Create a map from type to display name
const tabs: Tab[] = [
  { id: "academic-level", name: "Academic Level" },
  { id: "academic-qualification", name: "Academic Qualification" },
  { id: "age-group", name: "Age Group" },
  { id: "assessment-type", name: "Assessment Type" },
  { id: "business-type", name: "Business Type" },
  { id: "city", name: "City" },
  { id: "country", name: "Country" },
  { id: "company-file-type", name: "Company File Type" },
  { id: "delivery-tool", name: "Delivery Tool" },
  { id: "economic-background", name: "Economic Background" },
  { id: "education-level", name: "Education Level" },
  { id: "industry-type", name: "Industry Type" },
  { id: "instructional-method", name: "Instructional Method" },
  { id: "language", name: "Language" },
  { id: "learner-level", name: "Learner Level" },
  { id: "learner-style-preference", name: "Learning Style Preference" },
  { id: "learning-resource-type", name: "Learning Resource Type" },
  { id: "technological-requirement", name: "Technological Requirement" },
  { id: "technology-integration", name: "Technology Integration" },
  { id: "training-purpose", name: "Training Purpose" },
  { id: "work-experience", name: "Work Experience" },
  { id: "trainer-requirement", name: "Trainer Requirement" },
  { id: "disability", name: "Disability" },
  { id: "marginalized-group", name: "Marginalized Group" },
  { id: "training-type", name: "Training Type" },
]

interface SidebarTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function SidebarTabs({ activeTab, onTabChange }: SidebarTabsProps) {
  return (
    <div className="lg:w-[280px] w-[85%] md:w-[90%] bg-white h-[85%] overflow-y-auto rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "w-full text-left px-4 py-2 text-sm transition-colors",
            tab.id === activeTab
              ? "bg-[#EBF3FF] border-l-4 border-blue-500 font-medium"
              : "hover:bg-gray-50"
          )}
        >
          {tab.name}
        </button>
      ))}
    </div>
  )
} 