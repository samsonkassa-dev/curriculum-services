/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useMemo } from "react"
import { OutlineSidebar } from "@/components/ui/outline-sidebar"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useCreateTrainingProfile, useUpdateTrainingProfile } from "@/lib/hooks/useTrainingProfileMutations"

interface TrainingProfile {
  trainingId: string
  keywords: string[]
  scope: string
  rationale: string
  alignmentsWithStandard: string
  executiveSummary: string | null
}

interface TrainingProfileEditProps {
  trainingId: string
  initialData: TrainingProfile | null
  onSave: () => void
  onCancel: () => void
}

export function TrainingProfileEdit({ trainingId, initialData, onSave, onCancel }: TrainingProfileEditProps): JSX.Element {
  const [activeSection, setActiveSection] = useState("Keywords")
  const [keywords, setKeywords] = useState<string[]>([])
  const [scope, setScope] = useState("")
  const [rationale, setRationale] = useState("")
  const [alignment, setAlignment] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const createProfile = useCreateTrainingProfile()
  const updateProfile = useUpdateTrainingProfile()

  const isCreating = !initialData || (
    initialData.keywords.length === 0 &&
    !initialData.scope &&
    !initialData.rationale &&
    !initialData.alignmentsWithStandard
  )

  useEffect(() => {
    // Initialize form with existing data, handling null values
    if (initialData && !isCreating) {
      setKeywords(initialData.keywords || [])
      setScope(initialData.scope || "")
      setRationale(initialData.rationale || "")
      setAlignment(initialData.alignmentsWithStandard || "")
    } else {
      // For new creation, start with one empty keyword input
      setKeywords([""])
    }

    // Handle responsive behavior
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [initialData, isCreating])

  const outlineGroups = useMemo(() => [
    {
      title: "Course Definition",
      items: [
        { label: "Keywords", isCompleted: keywords.length > 0 },
        { label: "Scope", isCompleted: scope.length > 0 },
        { label: "Rationale", isCompleted: rationale.length > 0 },
        { label: "Alignment With Standard", isCompleted: alignment.length > 0 }
      ]
    }
  ], [keywords.length, scope, rationale, alignment])

  // Find first incomplete section on initial load
  useEffect(() => {
    const findFirstIncompleteSection = () => {
      for (const group of outlineGroups) {
        for (const item of group.items) {
          if (!item.isCompleted) {
            return item.label
          }
        }
      }
      return outlineGroups[0].items[0].label // Default to first item if all complete
    }

    setActiveSection(findFirstIncompleteSection())
  }, [])

  const addKeyword = () => {
    setKeywords([...keywords, ""])
  }

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords]
    newKeywords[index] = value
    setKeywords(newKeywords)
  }

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }


  const renderMobileHeader = () => {
    if (!isMobile) return null
    
    if (showSidebar) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-white z-[51] flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">Training Profile</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSidebar(false)}
            className="hover:bg-transparent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost"
          className="text-brand flex items-center gap-2 hover:bg-transparent hover:text-brand p-0"
          onClick={() => setShowSidebar(true)}
        >
          <Menu className="h-5 w-5" />
          <span>Training Profile Outline</span>
        </Button>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "Keywords":
        return (
          <div className="space-y-4 w-full">
            {keywords.length > 0 ? (
              keywords.map((keyword, index) => (
                <div key={index} className="flex gap-2 w-full">
                  <Input 
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    placeholder="Enter keyword"
                    className="w-full"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeKeyword(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              // Ensure there's always at least one input
              <Button 
                onClick={() => setKeywords([""])} 
                variant="link" 
                className="text-brand"
              >
                + Add keyword
              </Button>
            )}
            {keywords.length > 0 && (
              <Button 
                onClick={addKeyword} 
                variant="link" 
                className="text-brand"
              >
                + Add more
              </Button>
            )}
          </div>
        )
      case "Scope":
        return (
          <Textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Enter scope details"
            className="min-h-[200px] w-full"
          />
        )
      case "Rationale":
        return (
          <Textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Enter rationale"
            className="min-h-[200px] w-full"
          />
        )
      case "Alignment With Standard":
        return (
          <Textarea
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
            placeholder="Enter alignment with standard"
            className="min-h-[200px] w-full"
          />
        )
      default:
        return null
    }
  }

  const handleSaveAndContinue = async () => {
    // Find next section to navigate to
    const allItems = outlineGroups.flatMap(group => group.items)
    const currentIndex = allItems.findIndex(item => item.label === activeSection)
    
    if (currentIndex < allItems.length - 1) {
      setActiveSection(allItems[currentIndex + 1].label)
    } else {
      const data = {
        trainingId,
        keywords,
        scope,
        rationale,
        alignmentsWithStandard: alignment,
        executiveSummary: null
      }

      try {
        if (!isCreating) {
          await updateProfile.mutateAsync(data)
          toast.success("Training profile updated successfully")
        } else {
          await createProfile.mutateAsync(data)
          toast.success("Training profile created successfully")
        }
        onSave()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
  }

  return (
    <div className={cn(
      "px-[7%] py-10",
      isMobile ? "block" : "flex gap-8"
    )}>
      {renderMobileHeader()}
      
      {(!isMobile || showSidebar) && (
        <div className={cn(
          "",
          isMobile ? "fixed bg-white inset-0 z-50 pt-16 px-4 pb-4" : "w-[300px]"
        )}>
          <OutlineSidebar 
            title="Training Profile Outline"
            groups={outlineGroups}
            activeItem={activeSection}
            onItemClick={(section) => {
              setActiveSection(section)
              if (isMobile) setShowSidebar(false)
            }}
          />
        </div>
      )}

      <EditFormContainer
        title={`${activeSection}${!isCreating ? ' (Edit)' : ''}`}
        description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
      >
        {renderContent()}

        <div className="flex justify-end gap-4 pt-8">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSaveAndContinue} className="bg-brand text-white">
            {!isCreating ? 'Save Changes' : 'Save and Continue'}
          </Button>
        </div>
      </EditFormContainer>
    </div>
  )
}