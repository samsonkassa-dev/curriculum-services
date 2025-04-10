/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Training } from "@/types/training"
import {
  CreateTrainingStep1,
  CreateTrainingStep2,
  CreateTrainingStep3,
  CreateTrainingStep4,
} from "@/app/(company-admin)/[companyId]/training/create-training/components/create-training-forms"
import { CreateTrainingStep5 } from "@/app/(company-admin)/[companyId]/training/create-training/components/steps/step-5"
import { Button } from "@/components/ui/button"
import { apiToFormData, formToApiData, PreloadedFormData, BaseItem, TrainingFormData } from "@/types/training-form"
import { useBaseData } from "@/lib/hooks/useBaseData"

interface OverviewEditProps {
  training: Training
  initialStep?: number
  onSave: (data: Partial<Training>) => void
  onCancel: () => void
}

export function OverviewEdit({ training, initialStep = 1, onSave, onCancel }: OverviewEditProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [formData, setFormData] = useState<PreloadedFormData>(() => apiToFormData(training))
  const [dirtyFields, setDirtyFields] = useState<Set<keyof PreloadedFormData>>(() => {
    // Initialize with fields from the current step 
    // This ensures we track the fields the user is directly editing
    const initialDirtyFields = new Set<keyof PreloadedFormData>()
    
    // Add fields based on which step we're starting with
    switch (initialStep) {
      case 1:
        initialDirtyFields.add('title')
        initialDirtyFields.add('rationale')
        initialDirtyFields.add('trainingTypeId')
        break
      case 2:
        initialDirtyFields.add('countryIds')
        initialDirtyFields.add('cityIds')
        break
      case 3:
        initialDirtyFields.add('duration')
        initialDirtyFields.add('durationType')
        initialDirtyFields.add('trainingTypeId')
        break
      case 4:
        initialDirtyFields.add('ageGroupIds')
        initialDirtyFields.add('genderPercentages')
        initialDirtyFields.add('economicBackgroundIds')
        initialDirtyFields.add('academicQualificationIds')
        initialDirtyFields.add('disabilityPercentages')
        initialDirtyFields.add('marginalizedGroupPercentages')
        break
      case 5:
        initialDirtyFields.add('trainingPurposeIds')
        break
    }
    
    return initialDirtyFields
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Use refs to track parts of formData needed in the effect
  const formDataRef = useRef(formData)
  formDataRef.current = formData
  
  // Helper function to merge reference data arrays, preserving existing items
  const mergeReferenceData = useCallback(
    (existing: BaseItem[] | undefined, fetched: BaseItem[]): BaseItem[] => {
      if (!existing || existing.length === 0) return fetched
      
      const merged = [...fetched]
      
      // Add any existing items that aren't in the fetched data
      existing.forEach(item => {
        if (!merged.some(m => m.id === item.id)) {
          merged.push(item)
        }
      })
      
      return merged
    },
    []
  )

  // For fetching additional data when users change their selections
  // Base data should be enabled when the step is visible, regardless of preloaded data
  const { data: countries } = useBaseData('country', { 
    enabled: currentStep === 2  // Always fetch when on step 2
  })
  const { data: trainingTypes } = useBaseData('training-type', { 
    enabled: currentStep === 1 || currentStep === 3  // Always fetch when on step 1 or 3
  })
  const { data: ageGroups } = useBaseData('age-group', { 
    enabled: currentStep === 4 // Always fetch when on step 4
  })
  const { data: disabilities } = useBaseData('disability', { 
    enabled: currentStep === 4
  })
  const { data: marginalizedGroups } = useBaseData('marginalized-group', { 
    enabled: currentStep === 4
  })
  const { data: economicBackgrounds } = useBaseData('economic-background', { 
    enabled: currentStep === 4
  })
  const { data: academicQualifications } = useBaseData('academic-qualification', { 
    enabled: currentStep === 4
  })
  const { data: trainingPurposes } = useBaseData('training-purpose', { 
    enabled: currentStep === 5
  })

  // Merge preloaded data with fetched data to ensure complete datasets
  useEffect(() => {
    // Skip processing if data is still loading
    if (!countries && !trainingTypes && !ageGroups && !disabilities && 
        !marginalizedGroups && !economicBackgrounds && !academicQualifications && 
        !trainingPurposes) {
      return;
    }

    const currentFormData = formDataRef.current;
    
    // Compare incoming data with what we already have to avoid unnecessary updates
    const shouldUpdateCountries = countries?.length && 
      JSON.stringify(countries) !== JSON.stringify(currentFormData.preloadedCountries);
    
    const shouldUpdateTrainingTypes = trainingTypes?.length && 
      JSON.stringify(trainingTypes) !== JSON.stringify(currentFormData.preloadedTrainingTypes);
    
    const shouldUpdateAgeGroups = ageGroups?.length && 
      JSON.stringify(ageGroups) !== JSON.stringify(currentFormData.preloadedAgeGroups);
    
    const shouldUpdateDisabilities = disabilities?.length && 
      JSON.stringify(disabilities) !== JSON.stringify(currentFormData.preloadedDisabilities);
    
    const shouldUpdateMarginalizedGroups = marginalizedGroups?.length && 
      JSON.stringify(marginalizedGroups) !== JSON.stringify(currentFormData.preloadedMarginalizedGroups);
    
    const shouldUpdateEconomicBackgrounds = economicBackgrounds?.length && 
      JSON.stringify(economicBackgrounds) !== JSON.stringify(currentFormData.preloadedEconomicBackgrounds);
    
    const shouldUpdateAcademicQualifications = academicQualifications?.length && 
      JSON.stringify(academicQualifications) !== JSON.stringify(currentFormData.preloadedAcademicQualifications);
    
    const shouldUpdateTrainingPurposes = trainingPurposes?.length && 
      JSON.stringify(trainingPurposes) !== JSON.stringify(currentFormData.preloadedTrainingPurposes);
    
    // If no updates are needed, skip the state update entirely
    if (!shouldUpdateCountries && !shouldUpdateTrainingTypes && !shouldUpdateAgeGroups && 
        !shouldUpdateDisabilities && !shouldUpdateMarginalizedGroups && 
        !shouldUpdateEconomicBackgrounds && !shouldUpdateAcademicQualifications && 
        !shouldUpdateTrainingPurposes) {
      return;
    }

    // Use a timeout to debounce updates and batch changes
    const timeoutId = setTimeout(() => {
      const updates: Partial<PreloadedFormData> = {}
      const currentFormData = formDataRef.current
      
      if (countries?.length && shouldUpdateCountries) {
        // Always use fetched countries if available, but keep any preloaded ones that aren't in the fetched data
        const existingCountries = currentFormData.preloadedCountries || []
        const combinedCountries = [...countries]
        
        // Add any preloaded countries that aren't in the fetched data
        existingCountries.forEach(country => {
          if (!combinedCountries.some(c => c.id === country.id)) {
            combinedCountries.push(country)
          }
        })
        
        updates.preloadedCountries = combinedCountries
      }
      
      if (trainingTypes?.length && shouldUpdateTrainingTypes) {
        // Find selected training type in fetched data if it exists
        if (currentFormData.trainingTypeId) {
          const foundType = trainingTypes.find((t: any) => t.id === currentFormData.trainingTypeId)
          if (foundType) {
            updates.preloadedTrainingType = foundType
          }
        }
        // Store all available training types for selection
        updates.preloadedTrainingTypes = trainingTypes
      }
      
      if (ageGroups?.length && shouldUpdateAgeGroups) {
        updates.preloadedAgeGroups = mergeReferenceData(currentFormData.preloadedAgeGroups, ageGroups)
      }
      
      if (disabilities?.length && shouldUpdateDisabilities) {
        updates.preloadedDisabilities = mergeReferenceData(currentFormData.preloadedDisabilities, disabilities)
      }
      
      if (marginalizedGroups?.length && shouldUpdateMarginalizedGroups) {
        updates.preloadedMarginalizedGroups = mergeReferenceData(currentFormData.preloadedMarginalizedGroups, marginalizedGroups)
      }
      
      if (economicBackgrounds?.length && shouldUpdateEconomicBackgrounds) {
        updates.preloadedEconomicBackgrounds = mergeReferenceData(currentFormData.preloadedEconomicBackgrounds, economicBackgrounds)
      }
      
      if (academicQualifications?.length && shouldUpdateAcademicQualifications) {
        updates.preloadedAcademicQualifications = mergeReferenceData(currentFormData.preloadedAcademicQualifications, academicQualifications)
      }
      
      if (trainingPurposes?.length && shouldUpdateTrainingPurposes) {
        updates.preloadedTrainingPurposes = mergeReferenceData(currentFormData.preloadedTrainingPurposes, trainingPurposes)
      }
      
      // Only update state if we have actual changes
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }))
      }
    }, 100); // 100ms debounce
    
    // Cleanup timeout on dependency changes
    return () => clearTimeout(timeoutId);
  }, [
    countries, 
    trainingTypes, 
    ageGroups, 
    disabilities, 
    marginalizedGroups, 
    economicBackgrounds, 
    academicQualifications, 
    trainingPurposes,
    mergeReferenceData // include the memoized function
  ])

  // Track which fields have been changed
  const trackChanges = (newData: Partial<PreloadedFormData>) => {
    console.log("Tracking changes for:", Object.keys(newData));
    
    Object.keys(newData).forEach(key => {
      const typedKey = key as keyof PreloadedFormData
      // Skip reference data fields
      if (typedKey.startsWith('preloaded')) return
      
      // Make sure we're properly comparing the values
      const newValue = newData[typedKey];
      const oldValue = formData[typedKey];

      // Skip undefined values
      if (newValue === undefined) return;
      
      // For arrays, we need to compare lengths and content
      if (Array.isArray(newValue) && Array.isArray(oldValue)) {
        const isDifferent = 
          newValue.length !== oldValue.length || 
          JSON.stringify(newValue) !== JSON.stringify(oldValue);
        
        if (isDifferent) {
          console.log(`Field ${typedKey} changed from`, oldValue, "to", newValue);
          setDirtyFields(prev => new Set([...prev, typedKey]));
        }
      } 
      // For objects, use JSON.stringify
      else if (typeof newValue === 'object' && newValue !== null) {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          console.log(`Field ${typedKey} changed from`, oldValue, "to", newValue);
          setDirtyFields(prev => new Set([...prev, typedKey]));
        }
      } 
      // For primitives
      else if (newValue !== oldValue) {
        console.log(`Field ${typedKey} changed from`, oldValue, "to", newValue);
        setDirtyFields(prev => new Set([...prev, typedKey]));
      }
    });
  }

  const handleStepSave = (stepData: Partial<PreloadedFormData>) => {
    console.log("Step data received:", stepData);
    
    const updatedData = { ...formData, ...stepData }
    setFormData(updatedData)
    trackChanges(stepData)
    
    // Log the current dirty fields
    console.log("Current dirty fields:", Array.from(dirtyFields));
    
    // Automatically move to the next step
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      // If we're on the last step, trigger the save
      // Instead of sending only changed fields, transform the entire form data
      // This ensures all required fields are included in the PATCH request
      
      // First, create a complete form data object without preloaded data
      const completeFormData: Partial<TrainingFormData> = {
        title: updatedData.title,
        rationale: updatedData.rationale,
        trainingTypeId: updatedData.trainingTypeId,
        cityIds: updatedData.cityIds,
        countryIds: updatedData.countryIds,
        duration: updatedData.duration,
        durationType: updatedData.durationType,
        ageGroupIds: updatedData.ageGroupIds,
        economicBackgroundIds: updatedData.economicBackgroundIds,
        academicQualificationIds: updatedData.academicQualificationIds,
        genderPercentages: updatedData.genderPercentages,
        disabilityPercentages: updatedData.disabilityPercentages,
        marginalizedGroupPercentages: updatedData.marginalizedGroupPercentages,
        trainingPurposeIds: updatedData.trainingPurposeIds
      }
      
      console.log("Complete form data to transform:", completeFormData);
      const apiData = formToApiData(completeFormData);
      console.log("Data to send to API:", apiData);
      
      setIsSubmitting(true)
      onSave(apiData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      onCancel()
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreateTrainingStep1
            initialData={{
              title: formData.title || '',
              rationale: formData.rationale || '',
              trainingTypeId: formData.trainingTypeId || '',
              // Include reference data - both preloaded and fetched
              preloadedTrainingType: formData.preloadedTrainingType,
              preloadedTrainingTypes: formData.preloadedTrainingTypes
            }}
            onNext={handleStepSave}
            onBack={onCancel}
            isEditing={true}
          />
        )
      case 2:
        return (
          <CreateTrainingStep2
            initialData={{
              countryIds: formData.countryIds || [],
              cityIds: formData.cityIds || [],
              // Include reference data
              preloadedCountries: formData.preloadedCountries,
              preloadedCities: formData.preloadedCities
            }}
            onNext={handleStepSave}
            onBack={handleBack}
            onCancel={onCancel}
            isEditing={true}
          />
        )
      case 3:
        return (
          <CreateTrainingStep3
            initialData={{
              duration: formData.duration,
              durationType: formData.durationType,
              trainingTypeId: formData.trainingTypeId || '',
              // Include reference data
              preloadedTrainingType: formData.preloadedTrainingType,
              preloadedTrainingTypes: formData.preloadedTrainingTypes
            }}
            onNext={handleStepSave}
            onBack={handleBack}
            onCancel={onCancel}
            isEditing={true}
          />
        )
      case 4:
        return (
          <CreateTrainingStep4
            initialData={{
              ageGroupIds: formData.ageGroupIds || [],
              genderPercentages: formData.genderPercentages || [
                { gender: "MALE", percentage: 50 },
                { gender: "FEMALE", percentage: 50 }
              ],
              disabilityPercentages: formData.disabilityPercentages || [],
              marginalizedGroupPercentages: formData.marginalizedGroupPercentages || [],
              economicBackgroundIds: formData.economicBackgroundIds || [],
              academicQualificationIds: formData.academicQualificationIds || [],
              // Include reference data
              preloadedAgeGroups: formData.preloadedAgeGroups,
              preloadedDisabilities: formData.preloadedDisabilities,
              preloadedMarginalizedGroups: formData.preloadedMarginalizedGroups,
              preloadedEconomicBackgrounds: formData.preloadedEconomicBackgrounds,
              preloadedAcademicQualifications: formData.preloadedAcademicQualifications
            }}
            onNext={handleStepSave}
            onBack={handleBack}
            onCancel={onCancel}
            isEditing={true}
          />
        )
      case 5:
        return (
          <CreateTrainingStep5
            initialData={{
              trainingPurposeIds: formData.trainingPurposeIds || [],
              // Include reference data
              preloadedTrainingPurposes: formData.preloadedTrainingPurposes
            }}
            onNext={handleStepSave}
            onBack={handleBack}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            isEditing={true}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto py-8">
        {/* Step Content */}
        <div className="w-full mx-auto px-5">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
} 