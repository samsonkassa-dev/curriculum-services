"use client"

import { useState, useCallback } from "react"
import { useSectionsByModuleId, useCreateSection } from "@/lib/hooks/useSection"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Loading } from "@/components/ui/loading"
import { SectionView } from "./sectionView"
import { AssessmentMethod } from "./assesment-method"
import { AssessmentFormProvider } from "@/contexts/AssessmentFormContext"
import { SectionAddModal } from "./section/sectionAddModal"

interface SectionProps {
  moduleId: string
}

interface SectionFormData {
  name: string
  topic: string
  creditHour: number
  description: string
}

export function Section({ moduleId }: SectionProps) {
  const [showModal, setShowModal] = useState(false)
  const [showAssessment, setShowAssessment] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  
  const { data, isLoading } = useSectionsByModuleId(moduleId)
  const { mutateAsync: createSection } = useCreateSection()

  // Fix role names and checks
  const userRole = localStorage.getItem("user_role")
  const canEdit = userRole === "ROLE_COMPANY_ADMIN" || 
                 userRole === "ROLE_CURRICULUM_ADMIN" || 
                 userRole === "ROLE_SUB_CURRICULUM_ADMIN"
  const isViewOnly = userRole === "ROLE_ICOG_ADMIN" || userRole === "ROLE_CONTENT_DEVELOPER"

  const handleAddClick = useCallback(() => {
    console.log("Add click")
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const handleAssessmentClick = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId)
    setShowAssessment(true)
  }, [])

  const handleLessonClick = useCallback((sectionId: string) => {
    // Implement lesson navigation/creation
    console.log("Add lesson for section:", sectionId)
  }, [])

  const handleSubmit = async (data: SectionFormData) => {
    try {
      await createSection({
        moduleId,
        ...data
      })
      setShowModal(false)
    } catch (error) {
      console.error("Failed to create section:", error)
      // Add error handling/toast here
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (showAssessment && selectedSectionId) {
    return (
      <AssessmentFormProvider sectionId={selectedSectionId}>
        <AssessmentMethod sectionId={selectedSectionId} />
      </AssessmentFormProvider>
    )
  }

  const isEmptySections = !data?.sections?.length

  if (isEmptySections) {
    if (canEdit) {
      return (
        <>
          <div className="w-full mx-auto py-10">
            <div className="mx-[7%] border-2 border-dashed rounded-lg p-4 bg-[#fbfbfb]">
              <div className="flex w-full items-start">
                <Button
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600 bg-[#fbfbfb] hover:bg-blue-50/50 flex items-start gap-2"
                  onClick={handleAddClick}
                >
                  <Image
                    src="/modulePlus.svg"
                    alt="Add Section"
                    width={16}
                    height={20}
                    className="mt-[2px]"
                  />
                  <span className="font-semibold">Section</span>     
                </Button>
              </div>
            </div>
          </div>
          <SectionAddModal 
            isOpen={showModal}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
          />
        </>
      )
    }

    // Show message for view-only roles
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No sections added yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="px-[7%] py-10 mb-10">
        <SectionView
          sections={data?.sections || []}
          onAddClick={handleAddClick}
          onEditClick={() => {}}
          onLessonClick={handleLessonClick}
          onAssessmentClick={handleAssessmentClick}
          canEdit={canEdit}
        />

        {canEdit && (
          <Button 
            variant="ghost" 
            className="w-full border-2 border-dashed rounded-lg py-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 mt-4 justify-start pl-6"
            onClick={handleAddClick}
          >
            <Image
              src="/modulePlus.svg"
              alt="Add Section"
              width={16}
              height={20}
            />
            <span className="ml-2">Section</span>
          </Button>
        )}
      </div>
      <SectionAddModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </>
  )
}
