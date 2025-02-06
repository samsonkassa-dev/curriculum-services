"use client"

import { useModuleInformation } from "@/contexts/ModuleInformationContext"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Textarea } from "@/components/ui/textarea"

export function InclusionStrategies() {
  const { formData, updateFormData } = useModuleInformation()

  return (
    <EditFormContainer title="" description="">
      <div className="space-y-8 pr-0 md:pr-8">
        <div>
          <h2 className="text-base md:text-lg font-semibold">Inclusion Strategies</h2>
          <p className="text-sm text-[#99948E] mb-4">
            Enter a brief overview of this section
          </p>
          <Textarea
            value={formData.inclusionStrategy}
            onChange={(e) => updateFormData('inclusionStrategy', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </div>
      </div>
    </EditFormContainer>
  )
}
