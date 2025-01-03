"use client"

import { ChevronRight } from "lucide-react"

interface Training {
  title: string
  cities: {
    name: string
  }[]
  duration: number
  durationType: string
  ageGroups: {
    name: string
    range: string
  }[]
  targetAudienceGenders: string[]
  economicBackgrounds: {
    name: string
  }[]
  academicQualifications: {
    name: string
  }[]
  trainingPurposes: {
    name: string
  }[]
}

interface OverviewProps {
  training: Training
}

export function Overview({ training }: OverviewProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/edit.svg" alt="" className="w-5 h-5" />
          <span className="font-medium">Title</span>
        </div>
        <div className="flex items-center text-gray-500">
          <span>{training.title}</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/location.svg" alt="" className="w-5 h-5" />
          <span className="font-medium">Location</span>
        </div>
        <div className="flex items-center text-gray-500">
          <span>{training.cities[0]?.name || 'N/A'}</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/duration.svg" alt="" className="w-5 h-5" />
          <span className="font-medium">Duration</span>
        </div>
        <div className="flex items-center text-gray-500">
          <span>{`${training.duration} ${training.durationType.toLowerCase()}`}</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/target.svg" alt="" className="w-5 h-5" />
          <span className="font-medium">Target Audience</span>
        </div>
        <div className="flex items-center text-gray-500">
          <span>
            {`${training.ageGroups[0]?.name || 'N/A'} (${training.ageGroups[0]?.range || 'N/A'}), ${training.targetAudienceGenders[0] || 'N/A'}`}
          </span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/purpose.svg" alt="" className="w-5 h-5" />
          <span className="font-medium">Purpose of the training</span>
        </div>
        <div className="flex items-center text-gray-500">
          <span>{training.trainingPurposes[0]?.name || 'N/A'}</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </div>
      </div>
    </div>
  )
} 