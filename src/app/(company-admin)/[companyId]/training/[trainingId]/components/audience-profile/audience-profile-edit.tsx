/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { OutlineSidebar } from "@/components/ui/outline-sidebar"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useCreateAudienceProfile, useUpdateAudienceProfile } from "@/lib/hooks/useAudienceProfileMutations"
import { useBaseData } from "@/lib/hooks/useBaseData"

interface BaseItem {
  id: string
  name: string
  description: string
}

interface AudienceProfile {
  learnerLevelId: string
  academicLevelId: string
  learningStylePreferenceIds: string[]
  priorKnowledgeList: string[]
  professionalBackground: string
  trainingId: string
}

interface AudienceProfileEditProps {
  trainingId: string
  initialData: AudienceProfile | null
  learnerLevels: BaseItem[]
  academicLevels: BaseItem[]
  learnerStylePreferences: BaseItem[]
  onSave: () => void
  onCancel: () => void
}

export function AudienceProfileEdit({ 
  trainingId, 
  initialData, 
  learnerLevels,
  academicLevels,
  learnerStylePreferences,
  onSave, 
  onCancel 
}: AudienceProfileEditProps) {

  const [activeSection, setActiveSection] = useState("Learning Level")
  const [learnerLevelId, setLearnerLevelId] = useState("")
  const [academicLevelId, setAcademicLevelId] = useState("")
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [hasPriorKnowledge, setHasPriorKnowledge] = useState<"Yes" | "No" | "">("")
  const [priorKnowledge, setPriorKnowledge] = useState<string[]>([])
  const [professionalBackground, setProfessionalBackground] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const createProfile = useCreateAudienceProfile()
  const updateProfile = useUpdateAudienceProfile()

  useEffect(() => {
    if (initialData) {
      setLearnerLevelId(initialData.learnerLevelId)
      setAcademicLevelId(initialData.academicLevelId)
      setSelectedStyles(initialData.learningStylePreferenceIds)
      setPriorKnowledge(initialData.priorKnowledgeList)
      setProfessionalBackground(initialData.professionalBackground)
    }

    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [initialData])

  useEffect(() => {
    if (hasPriorKnowledge === "Yes" && priorKnowledge.length === 0) {
      setPriorKnowledge([""])
    }
  }, [hasPriorKnowledge])

  const outlineItems = [
    { 
      label: "Learning Level", 
      isCompleted: !!learnerLevelId && !!academicLevelId && selectedStyles.length > 0 
    },
    { 
      label: "Prior Experience", 
      isCompleted: hasPriorKnowledge === "No" || (hasPriorKnowledge === "Yes" && priorKnowledge.length > 0 && priorKnowledge.some(k => k.trim() !== ""))
    },
    { 
      label: "Professional", 
      isCompleted: !!professionalBackground 
    }
  ]

  const addPriorKnowledge = () => {
    setPriorKnowledge([...priorKnowledge, ""])
  }

  const updatePriorKnowledge = (index: number, value: string) => {
    const newList = [...priorKnowledge]
    newList[index] = value
    setPriorKnowledge(newList)
  }

  const removePriorKnowledge = (index: number) => {
    setPriorKnowledge(priorKnowledge.filter((_, i) => i !== index))
  }

  const renderMobileHeader = () => {
    if (!isMobile) return null
    
    if (showSidebar) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-white z-[51] flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">Audience Profile Outline</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSidebar(false)}
            className="hover:bg-transparent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost"
          className="text-brand flex items-center gap-2 hover:bg-transparent hover:text-brand p-0"
          onClick={() => setShowSidebar(true)}
        >
          <Menu className="h-5 w-5" />
          <span>Audience Profile Outline</span>
        </Button>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "Learning Level":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm text-gray-600">Level</label>
              <Select value={learnerLevelId} onValueChange={setLearnerLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {learnerLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-sm text-gray-600">Academic Level</label>
              <Select value={academicLevelId} onValueChange={setAcademicLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic level" />
                </SelectTrigger>
                <SelectContent>
                  {academicLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-sm text-gray-600">Learning Style Preferences</label>
              <div className="grid grid-cols-2 gap-4">
                {learnerStylePreferences.map((style) => (
                  <div key={style.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={style.id}
                      checked={selectedStyles.includes(style.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStyles([...selectedStyles, style.id])
                        } else {
                          setSelectedStyles(selectedStyles.filter(id => id !== style.id))
                        }
                      }}
                    />
                    <label htmlFor={style.id}>{style.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "Prior Experience":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Prior Knowledge</h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="yes"
                    checked={hasPriorKnowledge === "Yes"}
                    onChange={() => setHasPriorKnowledge("Yes")}
                    className="w-4 h-4 border-2 border-gray-300 rounded-full focus:ring-brand text-brand"
                  />
                  <label htmlFor="yes" className="text-gray-700">Yes</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="no"
                    checked={hasPriorKnowledge === "No"}
                    onChange={() => setHasPriorKnowledge("No")}
                    className="w-4 h-4 border-2 border-gray-300 rounded-full focus:ring-brand text-brand"
                  />
                  <label htmlFor="no" className="text-gray-700">No</label>
                </div>
              </div>
            </div>

            {hasPriorKnowledge === "Yes" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">
                    If Yes, Please specify any assumed knowledge or skills
                  </label>
                  <p className="text-sm text-gray-500">
                    Enter a brief overview of this section&apos;s content to give users a clear understanding of what to enter.
                  </p>
                </div>
                {priorKnowledge.map((knowledge, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={knowledge}
                      onChange={(e) => updatePriorKnowledge(index, e.target.value)}
                      placeholder="Enter prior knowledge or skill"
                      className="w-full"
                    />
                    {priorKnowledge.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePriorKnowledge(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  onClick={addPriorKnowledge}
                  variant="link"
                  className="text-brand"
                >
                  + Add more
                </Button>
              </div>
            )}
          </div>
        )

      case "Professional":
        return (
          <Textarea
            value={professionalBackground}
            onChange={(e) => setProfessionalBackground(e.target.value)}
            placeholder="Enter professional background"
            className="min-h-[200px] w-full"
          />
        )

      default:
        return null
    }
  }

  const handleSaveAndContinue = async () => {
    const currentIndex = outlineItems.findIndex(item => item.label === activeSection)
    
    if (currentIndex < outlineItems.length - 1) {
      setActiveSection(outlineItems[currentIndex + 1].label)
    } else {
      const data = {
        trainingId,
        learnerLevelId,
        academicLevelId,
        learningStylePreferenceIds: selectedStyles,
        priorKnowledgeList: hasPriorKnowledge === "Yes" ? priorKnowledge.filter(k => k.trim() !== "") : [],
        professionalBackground
      }

      try {
        if (initialData) {
          await updateProfile.mutateAsync(data)
        } else {
          await createProfile.mutateAsync(data)
        }
        toast.success(`Audience profile ${initialData ? 'updated' : 'created'} successfully`)
        onSave()
      } catch (error) {
        toast.error("Failed to save audience profile")
      }
    }
  }

  return (
    <div className={cn(
      "px-[7%] py-10",
      isMobile ? "block" : "flex gap-8"
    )}>
      {renderMobileHeader()}
      
      {(!isMobile || showSidebar) && (
        <div className={cn(
          "bg-white",
          isMobile ? "fixed inset-0 z-50 pt-16 px-4 pb-4" : "w-[300px]"
        )}>
          <OutlineSidebar 
            title="Audience Profile Outline"
            items={outlineItems}
            activeItem={activeSection}
            onItemClick={(section) => {
              setActiveSection(section)
              if (isMobile) setShowSidebar(false)
            }}
          />
        </div>
      )}

      <EditFormContainer
        title={activeSection}
        description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
      >
        {renderContent()}

        <div className="flex justify-end gap-4 pt-8">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSaveAndContinue} className="bg-brand text-white">
            Save and Continue
          </Button>
        </div>
      </EditFormContainer>
    </div>
  )
}
