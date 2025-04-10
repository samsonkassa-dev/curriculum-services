"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface ModuleReferenceResponse {
  code: string
  message: string
  references?: Array<{
    id: string
    definition: string
    moduleId: string
  }>
}

interface ModuleReferenceData {
  definition: string
  moduleId: string
}

// Custom hooks for module references
function useModuleReferences(moduleId: string) {
  return useQuery<ModuleReferenceResponse>({
    queryKey: ['moduleReferences', moduleId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/module/reference/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!moduleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

function useAddModuleReference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ModuleReferenceData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/module/add-reference`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['moduleReferences', variables.moduleId]
      })
      queryClient.invalidateQueries({
        queryKey: ['moduleReferencesCheck', variables.moduleId]
      })
    }
  })
}

interface ApiError {
  message: string
}

// Define the handle type for external access
export type ModuleReferencesHandle = {
  handleSave: () => Promise<void>;
}

interface ModuleReferencesProps {
  onContentChange?: (hasContent: boolean) => void;
}

export const ModuleReferences = forwardRef<ModuleReferencesHandle, ModuleReferencesProps>(
  ({ onContentChange }, ref) => {
    const params = useParams()
    const moduleId = params.moduleId as string
    const { data: referenceData } = useModuleReferences(moduleId)
    const { mutateAsync: addReference } = useAddModuleReference()
    
    const [references, setReferences] = useState<string[]>([''])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
      if (referenceData?.references?.length) {
        setReferences(referenceData.references.map(ref => ref.definition))
      }
    }, [referenceData])

    // Update parent about any content changes
    useEffect(() => {
      const hasContent = references.some(ref => ref.trim() !== '')
      if (onContentChange) {
        onContentChange(hasContent)
      }
    }, [references, onContentChange])

    const addReferenceItem = () => {
      setReferences([...references, ''])
    }

    const updateReferenceItem = (index: number, value: string) => {
      const newReferences = [...references]
      newReferences[index] = value
      setReferences(newReferences)
    }

    const removeReferenceItem = (index: number) => {
      if (references.length > 1) {
        setReferences(references.filter((_, i) => i !== index))
      }
    }

    const handleSave = async () => {
      try {
        setIsSubmitting(true)
        // Filter out empty references
        const validReferences = references.filter(ref => ref.trim() !== '')
        
        // Only make API calls if there are valid references
        if (validReferences.length > 0) {
          for (const reference of validReferences) {
            await addReference({
              definition: reference,
              moduleId
            })
          }
          toast.success("References saved successfully")
        }
      } catch (error: unknown) {
        const apiError = error as ApiError
        toast.error(apiError.message || "Failed to save references")
        throw error; // Re-throw for the parent to handle
      } finally {
        setIsSubmitting(false)
      }
    }

    // Expose the handleSave method to parent components
    useImperativeHandle(ref, () => ({
      handleSave
    }));

    return (
      <EditFormContainer title="" description="">
        <div className="space-y-8 pr-0 md:pr-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="md:text-base text-sm font-semibold">References</h2>
              <span className="text-[10px] md:text-xs text-blue-500">(Optional)</span>
            </div>
            <p className="text-sm text-[#99948E]">
              Add references and further reading materials for this module.
            </p>

            {references.map((reference, index) => (
              <div key={index} className="relative">
                <Input
                  value={reference}
                  onChange={(e) => updateReferenceItem(index, e.target.value)}
                  placeholder="Enter reference"
                  className="pr-10 text-sm md:text-base"
                />
                <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReferenceItem(index)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
                >
                  <img src="/delete.svg" alt="delete" className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              onClick={addReferenceItem}
              variant="link"
              className="text-brand text-sm md:text-base"
            >
              + Add Reference
            </Button>
          </div>
        </div>
      </EditFormContainer>
    )
  }
)

// Add display name to fix linter error
ModuleReferences.displayName = 'ModuleReferences'; 