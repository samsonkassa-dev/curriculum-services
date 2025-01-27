"use client"

import { useModuleInformation } from "@/contexts/ModuleInformationContext"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TitleProps {
  instructionalMethods: Array<{
    id: string
    name: string
    description: string
  }>
  technologyIntegrations: Array<{
    id: string
    name: string
    description: string
  }>
}

export function Title({ instructionalMethods, technologyIntegrations }: TitleProps) {
  const { formData, updateFormData } = useModuleInformation()

  const handleMethodToggle = (methodId: string, checked: boolean) => {
    const currentMethods = formData.instructionMethodIds || []
    const newMethods = checked 
      ? [...currentMethods, methodId]
      : currentMethods.filter(id => id !== methodId)
    updateFormData('instructionMethodIds', newMethods)
  }

  // Get selected technology name
//   const selectedTechnology = technologyIntegrations.find(
//     (tech) => tech.id === formData.technologyIntegrationId
//   );
//   console.log("Selected technology:", selectedTechnology);

  return (
    <EditFormContainer title="" description="">
      <div className="space-y-8 pr-0 md:pr-8">
        <div className="">
          <h2 className="text-sm md:text-base font-semibold">
            Instructional Methods
          </h2>
          <p className="text-[12px] text-[#99948E]">
            The core teaching methods used to deliver content and facilitate
            learning.
          </p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4">
            {/* Left column */}
            <div className="space-y-4">
              {instructionalMethods
                .slice(0, Math.ceil(instructionalMethods.length / 2))
                .map((method) => (
                  <div key={method.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={method.id}
                      checked={Boolean(
                        formData.instructionMethodIds?.includes(method.id)
                      )}
                      onCheckedChange={(checked) =>
                        handleMethodToggle(method.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={method.id}
                      className="text-sm md:text-base text-gray-500 font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {method.name}
                    </label>
                  </div>
                ))}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {instructionalMethods
                .slice(Math.ceil(instructionalMethods.length / 2))
                .map((method) => (
                  <div key={method.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={method.id}
                      checked={Boolean(
                        formData.instructionMethodIds?.includes(method.id)
                      )}
                      onCheckedChange={(checked) =>
                        handleMethodToggle(method.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={method.id}
                      className="text-sm md:text-base text-gray-500 font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {method.name}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm md:text-base font-semibold">
            Differentiation Strategies
          </h2>
          <p className="text-[12px] text-[#99948E] pb-4">
            How the developer will modify their teaching to meet the diverse
            needs of learners.
          </p>
          <Textarea
            value={formData.differentiationStrategies}
            onChange={(e) =>
              updateFormData("differentiationStrategies", e.target.value)
            }
            className="min-h-[100px] text-sm"
          />
        </div>

        <div>
          <h2 className="text-sm md:text-base font-semibold">
            Technology Integration
          </h2>
          <p className="text-[12px] text-[#99948E]">
            specific technology tools used to support teaching and learning.
          </p>
          <div className="space-y-4 pt-4">
            <Select
              defaultValue={formData.technologyIntegrationId}
              onValueChange={(value) =>
                updateFormData("technologyIntegrationId", value)
              }
            >
              <SelectTrigger>
                <SelectValue>
                  {technologyIntegrations.find(
                    (t) => t.id === formData.technologyIntegrationId
                  )?.name || "Select technology"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {technologyIntegrations.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              value={formData.technologyIntegrationDescription}
              onChange={(e) =>
                updateFormData(
                  "technologyIntegrationDescription",
                  e.target.value
                )
              }
              placeholder="Describe how this technology is going to be used"
              className="min-h-[100px] text-sm"
            />
          </div>
        </div>
      </div>
    </EditFormContainer>
  );
}
