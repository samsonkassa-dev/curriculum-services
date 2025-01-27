"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { useModuleInformation } from "@/contexts/ModuleInformationContext"

// interface KeyConceptsProps {
//   moduleId: string
// }

export function KeyConcepts() {
  const { formData, updateFormData } = useModuleInformation()


  return (
    <EditFormContainer title="" description="">
      <div className="space-y-8 pr-0 md:pr-8">
        <div className="">
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-semibold">Key Concepts</h2>
            <span className="text-[10px] md:text-xs text-red-500">
              (Mandatory)
            </span>
          </div>
          <p className="text-[12px] text-[#99948E]">
            Enter a brief overview of this section&apos;s content to give users
            a clear understanding of what to enter.
          </p>

          <div className="mt-4">
            <Input
              value={formData.keyConcepts}
              onChange={(e) => updateFormData("keyConcepts", e.target.value)}
              placeholder="Enter key concept"
              className="text-sm md:text-base"
            />
          </div>
        </div>
      </div>
    </EditFormContainer>
  );
} 