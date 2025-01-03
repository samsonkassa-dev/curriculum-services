"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { useBaseData } from '@/lib/hooks/useBaseData'
import { StepProps } from '../types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"

interface BaseItem {
  id: string
  name: string
  description: string
}

type Gender = 'MALE' | 'FEMALE'

export function CreateTrainingStep4({ onNext, onBack }: StepProps) {
  const { data: ageGroups, isLoading: isLoadingAgeGroups } = useBaseData('age-group')
  const { data: economicBackgrounds, isLoading: isLoadingEconomicBackgrounds } = useBaseData('economic-background')
  const { data: academicQualifications, isLoading: isLoadingAcademicQualifications } = useBaseData('academic-qualification')

  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState<string>('')
  const [selectedEconomicBackgroundId, setSelectedEconomicBackgroundId] = useState<string>('')
  const [selectedAcademicQualificationIds, setSelectedAcademicQualificationIds] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState<Gender>()

  const [openAcademicQualifications, setOpenAcademicQualifications] = useState(false)

  const safeAgeGroups = ageGroups || []
  const safeEconomicBackgrounds = economicBackgrounds || []
  const safeAcademicQualifications = academicQualifications || []

  const handleSelectAcademicQualification = (id: string) => {
    setSelectedAcademicQualificationIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    onNext({
      ageGroupIds: [selectedAgeGroupId],
      economicBackgroundIds: [selectedEconomicBackgroundId],
      academicQualificationIds: selectedAcademicQualificationIds,
      targetAudienceGenders: selectedGender ? [selectedGender] : []
    })
  }

  const isValid = selectedAgeGroupId && 
    selectedEconomicBackgroundId && 
    selectedAcademicQualificationIds.length > 0 &&
    selectedGender

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Who are the target audience?
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          Enter brief description about this question here
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Age Group</label>
          <Select
            value={selectedAgeGroupId}
            onValueChange={setSelectedAgeGroupId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              {safeAgeGroups.map((item: BaseItem) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Economic Background</label>
          <Select
            value={selectedEconomicBackgroundId}
            onValueChange={setSelectedEconomicBackgroundId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select economic background" />
            </SelectTrigger>
            <SelectContent>
              {safeEconomicBackgrounds.map((item: BaseItem) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Academic Qualifications</label>
          <Popover open={openAcademicQualifications} onOpenChange={setOpenAcademicQualifications}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={isLoadingAcademicQualifications}
              >
                <div className="flex flex-wrap gap-1">
                  {selectedAcademicQualificationIds.length > 0 ? (
                    selectedAcademicQualificationIds.map(id => {
                      const name = safeAcademicQualifications.find((item: BaseItem) => item.id === id)?.name
                      return (
                        <Badge key={id} variant="pending">
                          {name}
                        </Badge>
                      )
                    })
                  ) : (
                    "Select academic qualifications..."
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-[300px] overflow-auto">
                {safeAcademicQualifications.map((item: BaseItem) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100",
                      selectedAcademicQualificationIds.includes(item.id) && "bg-gray-100"
                    )}
                    onClick={() => handleSelectAcademicQualification(item.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedAcademicQualificationIds.includes(item.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.name}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gender</label>
          <Select
            value={selectedGender}
            onValueChange={(value: Gender) => setSelectedGender(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between pt-8">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-8"
            disabled={!isValid}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
} 