/* eslint-disable no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client"

import { cn } from "@/lib/utils"

type TabType = 'overview' | 'profile' | 'audience' | 'curriculum' | 'module'

interface TrainingTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TrainingTabs({ activeTab, onTabChange }: TrainingTabsProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex my-14 min-w-max gap-8 border-b-[0.5px] border-[#CED4DA] mb-6 px-[7%]">
        <button
          onClick={() => onTabChange("overview")}
          className={cn(
            "pb-4 text-sm font-medium flex items-center gap-2 relative",
            activeTab === "overview"
              ? "text-brand border-b-2 border-brand"
              : "text-gray-500"
          )}
        >
          <img
            src={
              activeTab === "overview"
                ? "/overview_active.svg"
                : "/overview.svg"
            }
            alt=""
            className="w-4 h-4"
          />
          Overview
        </button>

        <button
          onClick={() => onTabChange("profile")}
          className={cn(
            "pb-4 text-sm font-medium flex items-center gap-2 relative",
            activeTab === "profile"
              ? "text-brand border-b-2 border-brand"
              : "text-gray-500"
          )}
        >
          <img
            src={
              activeTab === "profile"
                ? "/training_active.svg"
                : "/trainingProfile.svg"
            }
            alt=""
            className="w-4 h-4"
          />
          Training Profile
        </button>

        <button
          onClick={() => onTabChange("audience")}
          className={cn(
            "pb-4 text-sm font-medium flex items-center gap-2 relative",
            activeTab === "audience"
              ? "text-brand border-b-2 border-brand"
              : "text-gray-500"
          )}
        >
          <img
            src={
              activeTab === "audience"
                ? "/audience_active.svg"
                : "/audienceProfile.svg"
            }
            alt=""
            className="w-4 h-4"
          />
          Audience Profile
        </button>

        <button
          onClick={() => onTabChange("curriculum")}
          className={cn(
            "pb-4 text-sm font-medium flex items-center gap-2 relative",
            activeTab === "curriculum"
              ? "text-brand border-b-2 border-brand"
              : "text-gray-500"
          )}
        >
          <img
            src={
              activeTab === "curriculum"
                ? "/curriculum_active.svg"
                : "/curriculum.svg"
            }
            alt=""
            className="w-4 h-4"
          />
          Curriculum
        </button>

        <button
          onClick={() => onTabChange("module")}
          className={cn(
            "pb-4 text-sm font-medium flex items-center gap-2 relative",
            activeTab === "module"
              ? "text-brand border-b-2 border-brand"
              : "text-gray-500"
          )}
        >
          <img
            src={activeTab === "module" ? "/module_active.svg" : "/module.svg"}
            alt=""
            className="w-4 h-4"
          />
          Module
        </button>

      </div>
    </div>
  );
} 