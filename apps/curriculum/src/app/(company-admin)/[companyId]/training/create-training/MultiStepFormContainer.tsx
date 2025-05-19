// apps/curriculum/src/app/(company-admin)/[companyId]/training/create-training/MultiStepFormContainer.tsx

import { useState, ReactElement, cloneElement } from "react";
import { useFormContext } from "react-hook-form";
// Import the combined schema directly
import { trainingFormSchema } from "@/types/training-form"; 
import { z } from "zod";

// Derive the type here
type TrainingFormData = z.infer<typeof trainingFormSchema>;

interface StepComponentProps {
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

interface MultiStepFormContainerProps {
  children: ReactElement<StepComponentProps>[];
  initialStep?: number;
  onComplete: (data: TrainingFormData) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export function MultiStepFormContainer({
  children,
  initialStep = 1,
  onComplete,
  onCancel,
  isEditing = false,
  isSubmitting = false
}: MultiStepFormContainerProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const { handleSubmit, trigger } = useFormContext<TrainingFormData>();
  
  const childrenArray = Array.isArray(children) ? children : [children];
  const totalSteps = childrenArray.length;
  const currentChild = childrenArray[currentStep - 1];
  
  const handleNext = async () => {
    const fieldsToValidate = getStepFields(currentStep, isEditing);
    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  return cloneElement(currentChild, {
    onNext: currentStep < totalSteps ? handleNext : handleSubmit(onComplete),
    onBack: currentStep > 1 ? handleBack : undefined,
    onCancel,
    isEditing,
    isSubmitting: currentStep === totalSteps && isSubmitting
  });
}

// Helper function with the correct validation logic
function getStepFields(step: number, isEditing = false): (keyof TrainingFormData)[] {
  switch (step) {
    case 1:
      return ["title", "rationale", "trainingTagIds"]; 
    case 2:
      return ["countryIds", "cityIds"];
    case 3:
      return ["duration", "durationType", "trainingTypeId", "deliveryMethod"]; 
    case 4:
      return ["ageGroupIds", "economicBackgroundIds", "academicQualificationIds", "genderPercentages", "totalParticipants"];
    case 5:
      return isEditing 
        ? ["trainingPurposeIds", "economicBackgroundIds", "academicQualificationIds"] 
        : ["trainingPurposeIds"];
    default:
      return [];
  }
} 