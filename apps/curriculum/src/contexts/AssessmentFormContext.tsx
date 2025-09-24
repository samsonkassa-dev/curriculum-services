"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  useSubmitAssessment,
  useGetAssessment,
} from "@/lib/hooks/useModuleAssessment";
import { Loading } from "@/components/ui/loading";

interface AssessmentMethod {
  id: string;
  name: string;
  description: string;
  assessmentSubType: "FORMATIVE" | "SUMMATIVE" | "OTHER";
}

// Define a common interface for the assessment data structure
interface AssessmentData {
  assessmentMethods: AssessmentMethod[];
}

interface AssessmentResponse {
  code: string;
  message: string;
  moduleAssessmentMethods?: AssessmentData & { moduleId: string };
  sectionAssessmentMethods?: AssessmentData & { sectionId: string };
}

interface AssessmentFormData {
  formative: Record<string, boolean>;
  summative: Record<string, boolean>;
  other: Record<string, boolean>;
}

interface FormDataFilled {
  formative: boolean;
  summative: boolean;
  other: boolean;
}

interface AssessmentFormContextType {
  formData: AssessmentFormData;
  isFormDataFilled: FormDataFilled;
  updateFormData: (
    type: keyof AssessmentFormData,
    methodId: string,
    value: boolean | string
  ) => void;
  submitForm: () => Promise<void>;
  hasAssessmentMethods: boolean;
  isEditing: boolean;
  originalAssessmentData: AssessmentData | null;
}

const AssessmentFormContext = createContext<AssessmentFormContextType | null>(
  null
);

const initialFormData: AssessmentFormData = {
  formative: {},
  summative: {},
  other: {},
};

const initialFormDataFilled: FormDataFilled = {
  formative: false,
  summative: false,
  other: false,
};

export function AssessmentFormProvider({
  children,
  moduleId,
}: {
  children: ReactNode;
  moduleId: string;
}) {
  const [formData, setFormData] = useState<AssessmentFormData>(initialFormData);
  const [isFormDataFilled, setIsFormDataFilled] = useState<FormDataFilled>(initialFormDataFilled);
  const [isEditing, setIsEditing] = useState(false);
  const [originalAssessmentData, setOriginalAssessmentData] =
    useState<AssessmentData | null>(null);
  const { mutateAsync: submitAssessment } = useSubmitAssessment(moduleId);
  const { data: existingData, isLoading: isLoadingAssessment } =
    useGetAssessment(moduleId, {
      staleTime: 1000 * 60 * 15, // 15 minutes cache
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
    });

  // Check if form data is filled for each type
  const checkFormDataFilled = (data: AssessmentFormData): FormDataFilled => {
    return {
      formative: Object.values(data.formative || {}).some(value => value === true),
      summative: Object.values(data.summative || {}).some(value => value === true),
      other: Object.values(data.other || {}).some(value => value === true),
    };
  };

  useEffect(() => {
    if (existingData) {
      // Handle both response structures (moduleAssessmentMethods or sectionAssessmentMethods)
      const assessmentData =
        existingData.moduleAssessmentMethods ||
        existingData.sectionAssessmentMethods;

      if (assessmentData) {
        setOriginalAssessmentData(assessmentData);

        const transformed: AssessmentFormData = {
          formative: {},
          summative: {},
          other: {},
        };

        assessmentData.assessmentMethods.forEach((method: AssessmentMethod) => {
          switch (method.assessmentSubType) {
            case "FORMATIVE":
              transformed.formative[method.id] = true;
              break;
            case "SUMMATIVE":
              transformed.summative[method.id] = true;
              break;
            case "OTHER":
              transformed.other[method.id] = true;
              break;
          }
        });

        setFormData(transformed);
        setIsFormDataFilled(checkFormDataFilled(transformed));

        // Set editing flag if there's existing data
        if (assessmentData.assessmentMethods.length > 0) {
          setIsEditing(true);
        }
      }
    }
  }, [existingData]);

  // Update isFormDataFilled whenever formData changes
  useEffect(() => {
    setIsFormDataFilled(checkFormDataFilled(formData));
  }, [formData]);

  const updateFormData = (
    type: keyof AssessmentFormData,
    methodId: string,
    value: boolean | string
  ) => {
    setFormData((prev: AssessmentFormData) => {
      const updated = {
        ...prev,
        [type]: {
          ...(prev[type] as Record<string, boolean | string>),
          [methodId]: value,
        },
      };
      
      return updated;
    });
  };

  const submitForm = async () => {
    const assessmentIds = [
      ...Object.entries(formData.formative)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id),
      ...Object.entries(formData.summative)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id),
      ...Object.entries(formData.other)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id),
    ];

    await submitAssessment({
      assessmentIds,
    });
  };

  // Improved method to check if we have assessment methods
  const hasAssessmentMethods = Boolean(
    (originalAssessmentData?.assessmentMethods?.length ?? 0) > 0
  );

  if (isLoadingAssessment) {
    return <Loading />;
  }

  return (
    <AssessmentFormContext.Provider
      value={{
        formData,
        isFormDataFilled,
        updateFormData,
        submitForm,
        hasAssessmentMethods,
        isEditing,
        originalAssessmentData,
      }}
    >
      {children}
    </AssessmentFormContext.Provider>
  );
}

export const useAssessmentForm = () => {
  const context = useContext(AssessmentFormContext);
  if (!context)
    throw new Error(
      "useAssessmentForm must be used within AssessmentFormProvider"
    );
  return context;
};
