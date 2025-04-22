"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAuthorizedApiInstance } from "@/lib/utils/auth"

interface ModuleAppendixResponse {
  code: string
  message: string
  appendices?: Array<{
    id: string
    definition: string
    moduleId: string
  }>
}

interface ModuleAppendixData {
  definition: string
  moduleId: string
}

// Custom hooks for module appendices
function useModuleAppendices(moduleId: string) {
  const api = getAuthorizedApiInstance();
  
  return useQuery<ModuleAppendixResponse>({
    queryKey: ['moduleAppendices', moduleId],
    queryFn: async () => {
      const { data } = await api.get(
        `/module/appendix/${moduleId}`
      )
      return data
    },
    enabled: !!moduleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

function useAddModuleAppendix() {
  const queryClient = useQueryClient()
  const api = getAuthorizedApiInstance();

  return useMutation({
    mutationFn: async (data: ModuleAppendixData) => {
      const response = await api.post(
        `/module/add-appendix`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['moduleAppendices', variables.moduleId]
      })
      queryClient.invalidateQueries({
        queryKey: ['moduleAppendicesCheck', variables.moduleId]
      })
    }
  })
}

interface ApiError {
  message: string
}

// Define the handle type for external access
export type ModuleAppendicesHandle = {
  handleSave: () => Promise<void>;
}

interface ModuleAppendicesProps {
  onContentChange?: (hasContent: boolean) => void;
}

export const ModuleAppendices = forwardRef<ModuleAppendicesHandle, ModuleAppendicesProps>(
  ({ onContentChange }, ref) => {
    const params = useParams()
    const moduleId = params.moduleId as string
    const { data: appendixData } = useModuleAppendices(moduleId)
    const { mutateAsync: addAppendix } = useAddModuleAppendix()
    
    const [appendices, setAppendices] = useState<string[]>([''])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
      if (appendixData?.appendices?.length) {
        setAppendices(appendixData.appendices.map(app => app.definition))
      }
    }, [appendixData])

    // Update parent about any content changes
    useEffect(() => {
      const hasContent = appendices.some(app => app.trim() !== '')
      if (onContentChange) {
        onContentChange(hasContent)
      }
    }, [appendices, onContentChange])

    const addAppendixItem = () => {
      setAppendices([...appendices, ''])
    }

    const updateAppendixItem = (index: number, value: string) => {
      const newAppendices = [...appendices]
      newAppendices[index] = value
      setAppendices(newAppendices)
    }

    const removeAppendixItem = (index: number) => {
      if (appendices.length > 1) {
        setAppendices(appendices.filter((_, i) => i !== index))
      }
    }

    const handleSave = async () => {
      try {
        setIsSubmitting(true)
        // Filter out empty appendices
        const validAppendices = appendices.filter(app => app.trim() !== '')
        
        // Only make API calls if there are valid appendices
        if (validAppendices.length > 0) {
          for (const appendix of validAppendices) {
            await addAppendix({
              definition: appendix,
              moduleId
            })
          }
          toast.success("Appendices saved successfully")
        }
      } catch (error: unknown) {
        const apiError = error as ApiError
        toast.error(apiError.message || "Failed to save appendices")
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
              <h2 className="md:text-base text-sm font-semibold">Appendices</h2>
              <span className="text-[10px] md:text-xs text-blue-500">(Optional)</span>
            </div>
            <p className="text-sm text-[#99948E]">
              Add supporting materials or additional information for this module.
            </p>

            {appendices.map((appendix, index) => (
              <div key={index} className="relative">
                <Input
                  value={appendix}
                  onChange={(e) => updateAppendixItem(index, e.target.value)}
                  placeholder="Enter appendix"
                  className="pr-10 text-sm md:text-base"
                />
                <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAppendixItem(index)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
                >
                  <img src="/delete.svg" alt="delete" className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              onClick={addAppendixItem}
              variant="link"
              className="text-brand text-sm md:text-base"
            >
              + Add Appendix
            </Button>
          </div>
        </div>
      </EditFormContainer>
    )
  }
)

// Add display name to fix linter error
ModuleAppendices.displayName = 'ModuleAppendices'; 