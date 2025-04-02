"use client"

import { useModuleInformation } from "@/contexts/ModuleInformationContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"

export function LearningResource() {
  const { formData, updateFormData } = useModuleInformation()

  const addItem = (field: 'primaryMaterials' | 'secondaryMaterials' | 'digitalTools') => {
    updateFormData(field, [...formData[field], ''])
  }

  const updateItem = (
    index: number,
    value: string,
    field: 'primaryMaterials' | 'secondaryMaterials' | 'digitalTools'
  ) => {
    const newItems = [...formData[field]]
    newItems[index] = value
    updateFormData(field, newItems)
  }

  const removeItem = (
    index: number,
    field: 'primaryMaterials' | 'secondaryMaterials' | 'digitalTools'
  ) => {
    if (formData[field].length > 1) {
      const newItems = formData[field].filter((_, i) => i !== index)
      updateFormData(field, newItems)
    }
  }

  return (
    <EditFormContainer title="" description="">
      <div className="space-y-8 pr-0 md:pr-8">
        {/* Primary Materials */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="md:text-base text-sm font-semibold">Textbook / Primary Materials</h2>
            <span className="text-[10px] md:text-xs text-red-500">(Mandatory)</span>
          </div>
        
          {formData.primaryMaterials.map((material, index) => (
            <div key={index} className="relative">
              <Input
                value={material}
                onChange={(e) => updateItem(index, e.target.value, 'primaryMaterials')}
                placeholder="Enter primary material"
                className="pr-10 text-sm md:text-base"
              />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index, 'primaryMaterials')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
              >
                <img src="/delete.svg" alt="delete" className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            onClick={() => addItem('primaryMaterials')}
            variant="link"
            className="text-brand text-sm md:text-base"
          >
            + Add more
          </Button>
        </div>

        {/* Supplemental Materials */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
           <h2 className="md:text-base text-sm font-semibold">Supplemental Materials</h2>
            <span className="text-[10px] md:text-xs text-blue-500">(Optional)</span>
          </div>

          {formData.secondaryMaterials.map((material, index) => (
            <div key={index} className="relative">
              <Input
                value={material}
                onChange={(e) => updateItem(index, e.target.value, 'secondaryMaterials')}
                placeholder="Enter supplemental material"
                className="pr-10 text-sm md:text-base"
              />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index, 'secondaryMaterials')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
              >
                <img src="/delete.svg" alt="delete" className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            onClick={() => addItem('secondaryMaterials')}
            variant="link"
            className="text-brand text-sm md:text-base"
          >
            + Add more
          </Button>
        </div>

        {/* Digital Tools */}
        {/* <div className="space-y-2">
          <div className="flex items-center gap-2">
           <h2 className="md:text-base text-sm font-semibold">Digital Tools</h2>
            <span className="text-[10px] md:text-xs text-blue-500">(Optional)</span>
          </div>

          {formData.digitalTools.map((tool, index) => (
            <div key={index} className="relative">
              <Input
                value={tool}
                onChange={(e) => updateItem(index, e.target.value, 'digitalTools')}
                placeholder="Enter digital tool"
                className="pr-10 text-sm md:text-base"
              />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index, 'digitalTools')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
              >
                <img src="/delete.svg" alt="delete" className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            onClick={() => addItem('digitalTools')}
            variant="link"
            className="text-brand text-sm md:text-base"
          >
            + Add more
          </Button>
        </div> */}


      </div>
    </EditFormContainer>
  )
} 