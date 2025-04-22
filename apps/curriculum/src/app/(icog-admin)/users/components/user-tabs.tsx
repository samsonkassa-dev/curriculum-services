"use client"

import { cn } from "@/lib/utils"

interface TabProps {
  activeTab: 'individual' | 'company';
  onTabChange: (tab: 'individual' | 'company') => void;
}

export function UserTabs({ activeTab, onTabChange }: TabProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange("company")}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-colors",
          activeTab === "company"
            ? "bg-blue-500 text-white"
            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        )}
      >
        <span className="flex items-center gap-2">
          {activeTab === "company" ? (
            <img src="/company.svg" alt="" className="w-4 h-4" />
          ) : (
            <img src="/company-dark.svg" alt="" className="w-4 h-4" />
          )}
          Company
        </span>
      </button>
      <button
        onClick={() => onTabChange("individual")}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-colors",
          activeTab === "individual"
            ? "bg-blue-500 text-white"
            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        )}
      >
        <span className="flex items-center gap-2">
          <img src="/individual.svg" alt="" className="w-4 h-4" />
          Individual
        </span>
      </button>
    </div>
  );
} 