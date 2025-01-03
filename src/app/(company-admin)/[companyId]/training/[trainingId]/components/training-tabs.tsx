"use client"

import { cn } from "@/lib/utils"

type TabType = 'overview' | 'profile' | 'audience' | 'curriculum' | 'module'

interface TrainingTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TrainingTabs({ activeTab, onTabChange }: TrainingTabsProps) {
  return (
    <div className="flex gap-8 border-b border-gray-200 mb-6">
      <button
        onClick={() => onTabChange('overview')}
        className={cn(
          "pb-4 text-sm font-medium flex items-center gap-2 relative",
          activeTab === 'overview'
            ? "text-brand border-b-2 border-brand"
            : "text-gray-500"
        )}
      >
        <img 
          src={activeTab === 'overview' ? "/overview-active.svg" : "/overview.svg"} 
          alt="" 
          className="w-4 h-4"
        />
        Overview
      </button>

      <button
        onClick={() => onTabChange('profile')}
        className={cn(
          "pb-4 text-sm font-medium flex items-center gap-2 relative",
          activeTab === 'profile'
            ? "text-brand border-b-2 border-brand"
            : "text-gray-500"
        )}
      >
        <img 
          src={activeTab === 'profile' ? "/profile-active.svg" : "/profile.svg"} 
          alt="" 
          className="w-4 h-4"
        />
        Training Profile
      </button>

      <button
        onClick={() => onTabChange('audience')}
        className={cn(
          "pb-4 text-sm font-medium flex items-center gap-2 relative",
          activeTab === 'audience'
            ? "text-brand border-b-2 border-brand"
            : "text-gray-500"
        )}
      >
        <img 
          src={activeTab === 'audience' ? "/audience-active.svg" : "/audience.svg"} 
          alt="" 
          className="w-4 h-4"
        />
        Audience Profile
      </button>

      <button
        onClick={() => onTabChange('curriculum')}
        className={cn(
          "pb-4 text-sm font-medium flex items-center gap-2 relative",
          activeTab === 'curriculum'
            ? "text-brand border-b-2 border-brand"
            : "text-gray-500"
        )}
      >
        <img 
          src={activeTab === 'curriculum' ? "/curriculum-active.svg" : "/curriculum.svg"} 
          alt="" 
          className="w-4 h-4"
        />
        Curriculum
      </button>

      <button
        onClick={() => onTabChange('module')}
        className={cn(
          "pb-4 text-sm font-medium flex items-center gap-2 relative",
          activeTab === 'module'
            ? "text-brand border-b-2 border-brand"
            : "text-gray-500"
        )}
      >
        <img 
          src={activeTab === 'module' ? "/module-active.svg" : "/module.svg"} 
          alt="" 
          className="w-4 h-4"
        />
        Module
      </button>
    </div>
  )
} 