/* eslint-disable no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client"

import { cn } from "@/lib/utils"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Loading } from "@/components/ui/loading"

type TabType = 'overview' | 'profile' | 'audience' | 'module' | 'evaluation' | 'students' | 'sessions'

interface TabConfig {
  id: TabType
  label: string
  icon: string
  activeIcon: string
}

const allTabs: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: '/overview.svg', activeIcon: '/overview_active.svg' },
  { id: 'profile', label: 'Training Profile', icon: '/trainingProfile.svg', activeIcon: '/training_active.svg' },
  { id: 'audience', label: 'Audience Profile', icon: '/audienceProfile.svg', activeIcon: '/audience_active.svg' },
  { id: 'module', label: 'Module', icon: '/module.svg', activeIcon: '/module_active.svg' },
  { id: 'students', label: 'Students', icon: '/student.svg', activeIcon: '/stuedntActive.svg' },
  { id: 'sessions', label: 'Sessions', icon: '/Schedule.svg', activeIcon: '/scheduleActive.svg' },
  { id: 'evaluation', label: 'Evaluation', icon: '/Evaluation.svg', activeIcon: '/EvaluationActive.svg' },
]

interface TrainingTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TrainingTabs({ activeTab, onTabChange }: TrainingTabsProps) {
  const { 
    isLoading,
    isCompanyAdmin,
    isProjectManager,
    isCurriculumAdmin,
    isSubCurriculumAdmin,
    isContentDeveloper,
    isTrainingAdmin,
    isTrainerAdmin,
    isTrainer,
    isMeExpert 
  } = useUserRole()

  if (isLoading) {
    return <div className="h-20"><Loading /></div>; 
  }

  let visibleTabs: TabConfig[] = []

  if (isProjectManager) {
    visibleTabs = allTabs
  } else if (isMeExpert) {
    visibleTabs = allTabs.filter(tab => ['overview', 'evaluation',].includes(tab.id))
  } else if (isCurriculumAdmin || isSubCurriculumAdmin || isContentDeveloper || isCompanyAdmin)  {
    visibleTabs = allTabs.filter(tab => !['students', 'evaluation', 'sessions'].includes(tab.id))
  } else if (isTrainingAdmin || isTrainerAdmin) {
    visibleTabs = allTabs.filter(tab => tab.id !== 'evaluation')
  } else if (isTrainer) {
    visibleTabs = allTabs.filter(tab => ['overview', 'profile', 'module'].includes(tab.id))
  }else {
    visibleTabs = allTabs.filter(tab => tab.id === 'overview') 
  }

  if (!visibleTabs.some(tab => tab.id === activeTab)) {
    if (visibleTabs.length > 0) {
      onTabChange(visibleTabs[0].id)
    }
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex my-14 min-w-max gap-8 border-b-[0.5px] border-[#CED4DA] mb-6 px-[7%]">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "pb-4 text-sm font-medium flex items-center gap-2 relative",
              activeTab === tab.id
                ? "text-brand border-b-2 border-brand"
                : "text-gray-500"
            )}
          >
            <img
              src={activeTab === tab.id ? tab.activeIcon : tab.icon}
              alt=""
              className={tab.id === 'module' ? "w-3 h-4" : "w-4 h-4"} 
            />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
} 