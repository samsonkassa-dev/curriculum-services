"use client"

import { cn } from "@/lib/utils"

interface UserTabsProps {
  activeTab: 'individual' | 'company'
  onTabChange: (tab: 'individual' | 'company') => void
}

export function UserTabs({ activeTab, onTabChange }: UserTabsProps) {
  return (
    <div className="flex gap-8 border-b border-gray-200 mb-6">
      <button
        onClick={() => onTabChange('individual')}
        className={cn(
          "pb-4 text-sm font-medium relative",
          activeTab === 'individual'
            ? "text-brand border-b-2 border-brand"
            : "text-gray-500"
        )}
      >
        Individual
      </button>
      <button
        onClick={() => onTabChange('company')}
        className={cn(
          "pb-4 text-sm font-medium relative",
          activeTab === 'company'
            ? "text-brand border-b-2 border-brand"
            : "text-gray-500"
        )}
      >
        Company
      </button>
    </div>
  )
} 