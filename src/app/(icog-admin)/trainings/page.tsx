"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { TrainingCard } from "./components/training-card"

const mockTrainings = [
  {
    id: "1",
    title: "Training Name",
    location: "Addis Ababa",
    duration: "2 Weeks",
    ageGroup: "Age group",
    description: "The training format encompasses the delivery mode and structure of the sessions. Choosing the right format is essential for maximizing. The training format encompasses the delivery mode and structure of the sessions. Choosing the right format is essential for maximizing."
  },
  {
    id: "2",
    title: "Training Name",
    location: "Addis Ababa",
    duration: "2 Weeks",
    ageGroup: "Age group",
    description: "The training format encompasses the delivery mode and structure of the sessions. Choosing the right format is essential for maximizing. The training format encompasses the delivery mode and structure of the sessions. Choosing the right format is essential for maximizing."
  }
]

export default function Trainings() {
  return (
    <div className="flex min-h-screen w-[calc(100%-85px)] pl-[85px] mx-auto">
      <div className="flex-1 p-8">
        <div className="flex items-center justify-end gap-4 mb-6">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Training"
              className="pl-10 h-10 bg-white border-gray-200 rounded-lg"
            />
          </div>
          <Button 
            variant="outline" 
            size="default"
            className="h-10 px-4 border-gray-200 rounded-lg font-medium"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-24">
          {mockTrainings.map((training) => (
            <TrainingCard
              key={training.id}
              title={training.title}
              location={training.location}
              duration={training.duration}
              ageGroup={training.ageGroup}
              description={training.description}
            />
          ))}
        </div>
      </div>
    </div>
  )
}