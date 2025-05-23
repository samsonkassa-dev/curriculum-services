"use client";

import { useAssessmentForm } from "@/contexts/AssessmentFormContext";
import { EditFormContainer } from "@/components/ui/edit-form-container";
import { Checkbox } from "@/components/ui/checkbox";

interface AssessmentMethod {
  id: string;
  name: string;
  description: string;
}

interface CheckboxAssessmentFormProps {
  assessmentMethods: AssessmentMethod[];
  title: string;
  formKey: "formative" | "summative" | "other";
  description?: string;
}

export function CheckboxAssessmentForm({
  assessmentMethods,
  title,
  formKey,
  description = "This specifies the core assessment methods used to assess the trainee's knowledge of the module.",
}: CheckboxAssessmentFormProps) {
  const { formData, updateFormData } = useAssessmentForm();

  const midpoint = Math.ceil(assessmentMethods.length / 2);
  const leftColumnMethods = assessmentMethods.slice(0, midpoint);
  const rightColumnMethods = assessmentMethods.slice(midpoint);

  return (
    <EditFormContainer title="" description="">
      <div className="space-y-8 pr-0 md:pr-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-semibold">{title}</h2>
            <span className="text-[10px] md:text-xs text-red-500">
              (Mandatory)
            </span>
          </div>
          <p className="text-[12px] text-[#99948E]">{description}</p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4">
            <div className="space-y-4">
              {leftColumnMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={method.id}
                    checked={formData[formKey][method.id] || false}
                    onCheckedChange={(checked) =>
                      updateFormData(formKey, method.id, checked as boolean)
                    }
                  />
                  <label htmlFor={method.id} className="cursor-pointer text-sm">
                    {method.name}
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {rightColumnMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={method.id}
                    checked={formData[formKey][method.id] || false}
                    onCheckedChange={(checked) =>
                      updateFormData(formKey, method.id, checked as boolean)
                    }
                  />
                  <label htmlFor={method.id} className="cursor-pointer text-sm">
                    {method.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {assessmentMethods.length === 0 && (
            <div className="mt-4 text-sm text-gray-500">
              No assessment methods available for this category
            </div>
          )}
        </div>
      </div>
    </EditFormContainer>
  );
}
