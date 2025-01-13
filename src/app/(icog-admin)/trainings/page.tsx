"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { TrainingCard } from "@/components/ui/training-card"
import { useTrainings } from "@/lib/hooks/useTrainings"
import { Loading } from "@/components/ui/loading"

export default function Trainings() {
  const { data, isLoading } = useTrainings()

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="flex min-h-screen md:w-[calc(100%-85px)] md:pl-[85px] mx-auto">
      <div className="flex-1 p-8">
        <div className="flex items-center justify-end gap-4 mb-6">
          <div className="relative md:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Training"
              className="pl-10 h-10 bg-white border-gray-200 rounded-lg text-sm md:text-md"
            />
          </div>
          <Button 
            variant="outline" 
            size="default"
            className="h-10 px-4 border-gray-200 rounded-lg font-medium text-xs md:text-md" 
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {data?.trainings.map((training) => (
            <TrainingCard
              key={training.id}
              id={training.id}
              title={training.title}
              location={training.cities[0]?.name || 'N/A'}
              duration={`${training.duration} ${training.durationType.toLowerCase()}`}
              ageGroup={training.ageGroups[0]?.name || 'N/A'}
              // description={training.trainingPurposes[0]?.description || 'No description available'}
            />
          ))}
        </div>

        {/* Show message if no trainings */}
        {!data?.trainings?.length && (
          <div className="text-center text-gray-500 mt-8">
            No trainings available
          </div>
        )}
      </div>
    </div>
  )
}