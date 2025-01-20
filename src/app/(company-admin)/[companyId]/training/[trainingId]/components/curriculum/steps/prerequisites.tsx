/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { BaseItem, PrerequisiteData } from "@/types/curriculum"


interface PrerequisitesProps {
  trainingId: string
  initialData?: PrerequisiteData | null
  educationLevels: BaseItem[]
  languages: BaseItem[]
  workExperiences: BaseItem[]
  onSave: (data: PrerequisiteData) => Promise<void>
  onCancel: () => void
}

export function Prerequisites({ trainingId, initialData, educationLevels, languages, workExperiences, onSave, onCancel }: PrerequisitesProps) {
  const [isValid, setIsValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Step 1 states
  const [languageProficiency, setLanguageProficiency] = useState(initialData?.languageId || "")
  const [minEducationLevel, setMinEducationLevel] = useState(initialData?.educationLevelId || "")
  const [specificCourses, setSpecificCourses] = useState<string[]>(
    initialData?.specificCourseList?.length ? initialData.specificCourseList : [""]
  )
  
  // Step 2 states
  const [certifications, setCertifications] = useState(initialData?.certifications || "")
  const [licenses, setLicenses] = useState(initialData?.licenses || "")
  const [workExperience, setWorkExperience] = useState(initialData?.workExperienceId || "")
  
  // Step 3 states
  const [specificPrerequisites, setSpecificPrerequisites] = useState<string[]>(
    initialData?.specificPrerequisites || []
  )

  // Add new state for radio selection
  const [hasPrerequisites, setHasPrerequisites] = useState<'yes' | 'no' | null>(
    initialData?.specificPrerequisites?.length ? 'yes' : null
  )

  // Modify validation to only affect the Save/Next button, not the sidebar
  const isStep1Valid = useMemo(() => {
    return languageProficiency || minEducationLevel || specificCourses.some(course => course.trim() !== "")
  }, [languageProficiency, minEducationLevel, specificCourses])

  const isStep2Valid = useMemo(() => {
    // At least one of these fields should be filled
    return certifications || licenses || workExperience
  }, [certifications, licenses, workExperience])

  const isStep3Valid = useMemo(() => {
    // If "yes" is selected, prerequisite should be filled
    if (hasPrerequisites === 'yes') {
      return specificPrerequisites[0]?.trim() !== ""
    }
    // If "no" is selected or null, it's valid
    return true
  }, [hasPrerequisites, specificPrerequisites])

  // Handle next step
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSaveAndContinue()
    }
  }

  // Handle back
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    } else {
      onCancel()
    }
  }

  // Get current step validation
  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return isStep1Valid
      case 2:
        return isStep2Valid
      case 3:
        return isStep3Valid
      default:
        return false
    }
  }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid])

  const handleSaveAndContinue = async () => {
    try {
      setIsSubmitting(true)
      await onSave({
        languageId: languageProficiency,
        educationLevelId: minEducationLevel,
        specificCourseList: specificCourses.filter(course => course.trim() !== ""),
        trainingId,
        certifications,
        licenses,
        workExperienceId: workExperience,
        specificPrerequisites: hasPrerequisites === 'yes' ? [specificPrerequisites[0]] : []
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSpecificCourse = () => {
    setSpecificCourses([...specificCourses, ""])
  }

  const updateSpecificCourse = (index: number, value: string) => {
    const newCourses = [...specificCourses]
    newCourses[index] = value
    setSpecificCourses(newCourses)
  }

  const removeSpecificCourse = (index: number) => {
    setSpecificCourses(specificCourses.filter((_, i) => i !== index))
  }

  // Populate select options with API data
  const renderLanguageOptions = () => {
    return languages.map(lang => (
      <SelectItem key={lang.id} value={lang.id}>
        {lang.name}
      </SelectItem>
    ))
  }

  const renderEducationLevelOptions = () => {
    return educationLevels.map(level => (
      <SelectItem key={level.id} value={level.id}>
        {level.name}
      </SelectItem>
    ))
  }

  const renderWorkExperienceOptions = () => {
    return workExperiences.map(experience => (
      <SelectItem key={experience.id} value={experience.id}>
        {experience.name}
      </SelectItem>
    ))
  }

  return (
    <EditFormContainer
      title={`Entry Requirements/Prerequisites ${currentStep === 1 ? '(Step 1 of 3)' : currentStep === 2 ? '(Step 2 of 3)' : '(Step 3 of 3)'}`}
      description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
    >
      <div className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">1. Language Proficiency</label>
                <span className="text-xs text-blue-500">(Optional)</span>
              </div>
              <p className="text-sm text-gray-500">What language is the course to be taught in?</p>
              <Select value={languageProficiency} onValueChange={setLanguageProficiency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {renderLanguageOptions()}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">2. Academics</label>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Minimum Education Level</p>
                  <Select value={minEducationLevel} onValueChange={setMinEducationLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderEducationLevelOptions()}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Specific Courses</p>
                  {specificCourses.map((course, index) => (
                    <div key={index} className="relative">
                      <Input
                        value={course}
                        onChange={(e) => updateSpecificCourse(index, e.target.value)}
                        placeholder="Enter course name"
                        className="pr-10"
                      />
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecificCourse(index)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
                      >
                        <img src="/delete.svg" alt="delete" className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addSpecificCourse}
                    variant="link"
                    className="text-brand"
                  >
                    + Add more courses
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">3. Training Programs</label>
                <span className="text-xs text-blue-500">(Optional)</span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Certifications</p>
                  <Input
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="Enter certification requirements"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Licenses</p>
                  <Input
                    value={licenses}
                    onChange={(e) => setLicenses(e.target.value)}
                    placeholder="Enter license requirements"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Years of Experience</p>
                  <Select value={workExperience} onValueChange={setWorkExperience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderWorkExperienceOptions()}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">4. Specific Prerequisites</label>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Are there specific prerequisites that learners must meet before starting the course?</p>
                  
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="prerequisites"
                        checked={hasPrerequisites === 'yes'}
                        onChange={() => setHasPrerequisites('yes')}
                        className="w-4 h-4 text-brand"
                      />
                      <span className="text-gray-700">Yes</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="prerequisites"
                        checked={hasPrerequisites === 'no'}
                        onChange={() => setHasPrerequisites('no')}
                        className="w-4 h-4 text-brand"
                      />
                      <span className="text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {hasPrerequisites === 'yes' && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">If yes, what are the required prerequisites?</p>
                    <Input
                      value={specificPrerequisites[0] || ''}
                      onChange={(e) => setSpecificPrerequisites([e.target.value])}
                      placeholder="Enter prerequisites"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-10 pt-8">
          <Button 
            variant="outline" 
            onClick={handleBack}
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-brand text-white"
            disabled={isSubmitting || !isCurrentStepValid}
          >
            {isSubmitting 
              ? "Saving..." 
              : currentStep === 3 
                ? (initialData ? "Edit" : "Save and Continue")
                : "Next Step"
            }
          </Button>
        </div>
      </div>
    </EditFormContainer>
  )
}
