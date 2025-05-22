"use client"

import { cn } from "@/lib/utils"
import { BASE_DATA_CONFIG, BaseDataType } from "@/types/base-data"

interface Tab {
  id: BaseDataType
  name: string
}

//basedata config from types/base-data.ts
const tabs: Tab[] = Object.entries(BASE_DATA_CONFIG).map(([id, config]) => ({ id: id as BaseDataType, name: config.label }))

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