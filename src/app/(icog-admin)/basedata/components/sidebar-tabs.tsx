"use client"

import { cn } from "@/lib/utils"

interface Tab {
  id: string
  name: string
}

const tabs: Tab[] = [
  { id: "education-level", name: "Level" },
  { id: "academic-level", name: "Academic Level" },
  { id: "learning-style", name: "Learning Style" },
  { id: "language", name: "Language" },
  { id: "training-programs", name: "Training Programs" },
  { id: "differentiation-strategies", name: "Differentiation Strategies" },
  { id: "instructional-methods", name: "Instructional Methods" },
  { id: "technology-integration", name: "Technology Integration" },
  { id: "mode-of-delivery", name: "Mode of Delivery" },
  { id: "assessment-type", name: "Assessment Type" },
  { id: "assessment-subtype", name: "Assessment SubType" },
  { id: "technological-requirement", name: "Technological Requirement" },
  { id: "actor-type", name: "Actor Type" },
  { id: "industry-type", name: "Industry Type" },
  { id: "business-type", name: "Business Type" },
]

interface SidebarTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function SidebarTabs({ activeTab, onTabChange }: SidebarTabsProps) {
  return (
    <div className="w-[280px] bg-white">
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