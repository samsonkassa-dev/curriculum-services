"use client"

import { Cohort } from "@/lib/hooks/useCohorts"
import { CohortCard } from "./cohort-card"

interface CohortListProps {
  cohorts: Cohort[]
}

export function CohortList({ cohorts }: CohortListProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {cohorts.length > 0 ? (
          cohorts.map((cohort) => (
            <CohortCard key={cohort.id} cohort={cohort} />
          ))
        ) : (
          <div className="text-center py-10 bg-[#fbfbfb] rounded-lg border-[0.1px]">
            <p className="text-gray-500 text-sm">
              No matching cohorts found
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 