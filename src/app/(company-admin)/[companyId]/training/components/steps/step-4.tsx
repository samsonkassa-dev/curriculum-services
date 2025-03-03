"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useBaseData } from '@/lib/hooks/useBaseData'
import { StepProps } from '../types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { targetAudienceSchema, TargetAudienceFormData } from '@/types/training-form'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { GenderSlider } from '@/components/ui/gender-slider'

interface BaseItem {
  id: string
  name: string
  description: string
}

type GenderType = "MALE" | "FEMALE"

export function CreateTrainingStep4({ onNext, onBack, initialData }: StepProps) {
  const { data: ageGroups } = useBaseData('age-group')
  const { data: disabilities } = useBaseData('disability')
  const { data: marginalizedGroups } = useBaseData('marginalized-group')
  const { data: economicBackgrounds } = useBaseData('economic-background')
  const { data: academicQualifications } = useBaseData('academic-qualification')

  // Popover states
  const [openDisabilities, setOpenDisabilities] = useState(false)
  const [openMarginalizedGroups, setOpenMarginalizedGroups] = useState(false)
  const [openEconomicBackgrounds, setOpenEconomicBackgrounds] = useState(false)
  const [openAcademicQualifications, setOpenAcademicQualifications] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TargetAudienceFormData>({
    resolver: zodResolver(targetAudienceSchema),
    defaultValues: {
      economicBackgroundIds: initialData?.economicBackgroundIds || [],
      academicQualificationIds: initialData?.academicQualificationIds || [],
      ageGroupIds: initialData?.ageGroupIds || [],
      genderPercentages: initialData?.genderPercentages || [
        { gender: "MALE", percentage: 50 },
        { gender: "FEMALE", percentage: 50 }
      ],
      disabilityPercentages: initialData?.disabilityPercentages || [],
      marginalizedGroupPercentages: initialData?.marginalizedGroupPercentages || []
    }
  })

  const ageGroupIds = watch('ageGroupIds')
  const economicBackgroundIds = watch('economicBackgroundIds')
  const academicQualificationIds = watch('academicQualificationIds')
  const genderPercentages = watch('genderPercentages')
  const disabilityPercentages = watch('disabilityPercentages')
  const marginalizedGroupPercentages = watch('marginalizedGroupPercentages')

  // Extract IDs for easier handling in UI
  const disabilityIds = disabilityPercentages?.map(d => d.disabilityId) || []
  const marginalizedGroupIds = marginalizedGroupPercentages?.map(m => m.marginalizedGroupId) || []

  // Safe arrays to prevent errors
  const safeAgeGroups = ageGroups || []
  const safeDisabilities = disabilities || []
  const safeMarginalizedGroups = marginalizedGroups || []
  const safeEconomicBackgrounds = economicBackgrounds || []
  const safeAcademicQualifications = academicQualifications || []


  // Handle age group selection
  const handleAgeGroupChange = (value: string) => {
    setValue('ageGroupIds', [value], { shouldValidate: true })
  }

  // Handle economic background selection
  const handleSelectEconomicBackground = (value: string) => {
    setValue('economicBackgroundIds', [value], { shouldValidate: true })
  }

  // Handle gender slider changes
  const handleGenderPercentageChange = (value: number) => {
    setValue('genderPercentages', [
      { gender: "MALE", percentage: value },
      { gender: "FEMALE", percentage: 100 - value }
    ], { shouldValidate: true })
  }

  // Handle disability selection
  const handleSelectDisability = (disabilityId: string) => {
    const newDisabilityPercentages = [...(disabilityPercentages || [])]
    
    // Check if it's already selected
    const existingIndex = newDisabilityPercentages.findIndex(d => d.disabilityId === disabilityId)
    
    if (existingIndex >= 0) {
      // Remove it if it exists
      newDisabilityPercentages.splice(existingIndex, 1)
    } else {
      // Add it with default 20% if it doesn't exist
      newDisabilityPercentages.push({
        disabilityId,
        percentage: 20
      })
    }
    
    setValue('disabilityPercentages', newDisabilityPercentages, { shouldValidate: true })
  }

  // Handle disability percentage change
  const handleDisabilityPercentageChange = (disabilityId: string, percentage: number | null) => {
    const newDisabilityPercentages = disabilityPercentages?.map(d => 
      d.disabilityId === disabilityId 
        ? { ...d, percentage: percentage === null ? 0 : Math.min(100, Math.max(1, percentage)) } 
        : d
    ) || []
    
    setValue('disabilityPercentages', newDisabilityPercentages, { shouldValidate: true })
  }

  // Handle marginalized group selection
  const handleSelectMarginalizedGroup = (groupId: string) => {
    const newMarginalizedGroupPercentages = [...(marginalizedGroupPercentages || [])]
    
    // Check if it's already selected
    const existingIndex = newMarginalizedGroupPercentages.findIndex(m => m.marginalizedGroupId === groupId)
    
    if (existingIndex >= 0) {
      // Remove it if it exists
      newMarginalizedGroupPercentages.splice(existingIndex, 1)
    } else {
      // Add it with default 20% if it doesn't exist
      newMarginalizedGroupPercentages.push({
        marginalizedGroupId: groupId,
        percentage: 20
      })
    }
    
    setValue('marginalizedGroupPercentages', newMarginalizedGroupPercentages, { shouldValidate: true })
  }

  // Handle marginalized group percentage change
  const handleMarginalizedGroupPercentageChange = (groupId: string, percentage: number | null) => {
    const newMarginalizedGroupPercentages = marginalizedGroupPercentages?.map(m => 
      m.marginalizedGroupId === groupId 
        ? { ...m, percentage: percentage === null ? 0 : Math.min(100, Math.max(1, percentage)) } 
        : m
    ) || []
    
    setValue('marginalizedGroupPercentages', newMarginalizedGroupPercentages, { shouldValidate: true })
  }

  // Handle academic qualification selection
  const handleSelectAcademicQualification = (qualificationId: string) => {
    let newQualificationIds: string[]
    
    if (academicQualificationIds.includes(qualificationId)) {
      newQualificationIds = academicQualificationIds.filter(id => id !== qualificationId)
    } else {
      newQualificationIds = [...academicQualificationIds, qualificationId]
    }
    
    setValue('academicQualificationIds', newQualificationIds, { shouldValidate: true })
  }

  const onSubmit = (data: TargetAudienceFormData) => {
    // If male is 100%, only include male in the data
    if (data.genderPercentages.find(g => g.gender === "MALE")?.percentage === 100) {
      data.genderPercentages = [{ gender: "MALE", percentage: 100 }]
    }
    // If female is 100%, only include female in the data
    else if (data.genderPercentages.find(g => g.gender === "FEMALE")?.percentage === 100) {
      data.genderPercentages = [{ gender: "FEMALE", percentage: 100 }]
    }
    
    onNext(data)
  }

  // Calculate male percentage for the slider
  const malePercentage = genderPercentages?.find(g => g.gender === "MALE")?.percentage || 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="lg:text-2xl md:text-xl text-lg font-semibold mb-2 text-center">
          Who are the target audience?
        </h2>
        <p className="lg:text-sm md:text-xs text-xs text-gray-500 text-center mb-8">
          Enter brief description about this question here
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Age Group Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Age Group</label>
          <Select value={ageGroupIds?.[0]} onValueChange={handleAgeGroupChange}>
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
          {errors.ageGroupIds && (
            <p className="text-sm text-red-500">{errors.ageGroupIds.message}</p>
          )}
        </div>

        {/* Gender Distribution */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Gender Distribution</label>

          {/* Single gender slider instead of two separate ones */}
          <GenderSlider
            value={[malePercentage]}
            onValueChange={([value]) => handleGenderPercentageChange(value)}
            max={100}
            step={1}
          />
        </div>

        {/* Disabilities Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Disabilities (Optional)</label>
          <Popover open={openDisabilities} onOpenChange={setOpenDisabilities}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between py-6"
                type="button"
              >
                <div className="flex flex-wrap gap-1 items-center">
                  {disabilityPercentages && disabilityPercentages.length > 0 ? (
                    <>
                      {(() => {
                        const disability = safeDisabilities.find((item: BaseItem) => 
                          item.id === disabilityPercentages[0].disabilityId
                        )
                        return (
                          <Badge key={disabilityPercentages[0].disabilityId} variant="pending">
                            {disability?.name} ({disabilityPercentages[0].percentage}%)
                          </Badge>
                        )
                      })()}
                      {disabilityPercentages.length > 1 && (
                        <span className="text-sm text-gray-500 ml-1">
                          + {disabilityPercentages.length - 1} more
                        </span>
                      )}
                    </>
                  ) : (
                    "Select disabilities..."
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-[300px] overflow-auto">
                {safeDisabilities.length > 0 ? (
                  safeDisabilities.map((disability: BaseItem) => (
                    <div key={disability.id} className="border-b border-gray-100 last:border-0">
                      <div
                        className={cn(
                          "flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100",
                          disabilityIds.includes(disability.id) && "bg-gray-50"
                        )}
                        onClick={() => handleSelectDisability(disability.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            disabilityIds.includes(disability.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {disability.name}
                      </div>
                      {disabilityIds.includes(disability.id) && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Percentage:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={disabilityPercentages?.find(d => d.disabilityId === disability.id)?.percentage || ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? null : parseInt(e.target.value);
                                handleDisabilityPercentageChange(disability.id, val);
                              }}
                              className="w-16 h-7 text-xs border rounded-md px-2"
                              aria-label={`Percentage for ${disability.name}`}
                              title={`Set percentage for ${disability.name}`}
                            />
                            <span className="text-xs">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No disabilities available
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Marginalized Groups Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Marginalized Groups (Optional)</label>
          <Popover open={openMarginalizedGroups} onOpenChange={setOpenMarginalizedGroups}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between py-6"
                type="button"
              >
                <div className="flex flex-wrap gap-1 items-center">
                  {marginalizedGroupPercentages && marginalizedGroupPercentages.length > 0 ? (
                    <>
                      {(() => {
                        const group = safeMarginalizedGroups.find((item: BaseItem) => 
                          item.id === marginalizedGroupPercentages[0].marginalizedGroupId
                        )
                        return (
                          <Badge key={marginalizedGroupPercentages[0].marginalizedGroupId} variant="pending">
                            {group?.name} ({marginalizedGroupPercentages[0].percentage}%)
                          </Badge>
                        )
                      })()}
                      {marginalizedGroupPercentages.length > 1 && (
                        <span className="text-sm text-gray-500 ml-1">
                          + {marginalizedGroupPercentages.length - 1} more
                        </span>
                      )}
                    </>
                  ) : (
                    "Select marginalized groups..."
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-[400px] overflow-auto">
                {safeMarginalizedGroups.length > 0 ? (
                  safeMarginalizedGroups.map((group: BaseItem) => (
                    <div key={group.id} className="border-b border-gray-100 last:border-0">
                      <div
                        className={cn(
                          "flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100",
                          marginalizedGroupIds.includes(group.id) && "bg-gray-50"
                        )}
                        onClick={() => handleSelectMarginalizedGroup(group.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            marginalizedGroupIds.includes(group.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {group.name}
                      </div>
                      {marginalizedGroupIds.includes(group.id) && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Percentage:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={marginalizedGroupPercentages?.find(m => m.marginalizedGroupId === group.id)?.percentage || ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? null : parseInt(e.target.value);
                                handleMarginalizedGroupPercentageChange(group.id, val);
                              }}
                              className="w-16 h-7 text-xs border rounded-md px-2"
                              aria-label={`Percentage for ${group.name}`}
                              title={`Set percentage for ${group.name}`}
                            />
                            <span className="text-xs">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No marginalized groups available
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Economic Backgrounds Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Economic Background</label>
          <Select
            value={economicBackgroundIds?.[0]}
            onValueChange={handleSelectEconomicBackground}
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
          {errors.economicBackgroundIds && (
            <p className="text-sm text-red-500">
              {errors.economicBackgroundIds.message}
            </p>
          )}
        </div>

        {/* Academic Qualifications Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Academic Qualifications</label>
          <Popover
            open={openAcademicQualifications}
            onOpenChange={setOpenAcademicQualifications}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between py-6"
                type="button"
              >
                <div className="flex flex-wrap gap-1 items-center">
                  {academicQualificationIds.length > 0 ? (
                    <>
                      {(() => {
                        const qualification = safeAcademicQualifications.find(
                          (q: BaseItem) => q.id === academicQualificationIds[0]
                        );
                        return (
                          <Badge key={academicQualificationIds[0]} variant="pending">
                            {qualification?.name}
                          </Badge>
                        );
                      })()}
                      {academicQualificationIds.length > 1 && (
                        <span className="text-sm text-gray-500 ml-1">
                          + {academicQualificationIds.length - 1} more
                        </span>
                      )}
                    </>
                  ) : (
                    "Select academic qualifications..."
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-[300px] overflow-auto">
                {safeAcademicQualifications.length > 0 ? (
                  safeAcademicQualifications.map((qualification: BaseItem) => (
                    <div
                      key={qualification.id}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100",
                        academicQualificationIds.includes(qualification.id) &&
                          "bg-gray-100"
                      )}
                      onClick={() =>
                        handleSelectAcademicQualification(qualification.id)
                      }
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          academicQualificationIds.includes(qualification.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {qualification.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No academic qualifications available
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.academicQualificationIds && (
            <p className="text-sm text-red-500">
              {errors.academicQualificationIds.message}
            </p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8">
          <Button onClick={onBack} variant="outline" type="button">
            Back
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="bg-blue-500 text-white px-8"
            disabled={
              !ageGroupIds?.length ||
              !economicBackgroundIds?.length ||
              !academicQualificationIds?.length
            }
            type="button"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
} 