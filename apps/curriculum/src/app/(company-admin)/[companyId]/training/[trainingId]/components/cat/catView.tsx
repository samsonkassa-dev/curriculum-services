"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { Plus } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { 
  TrainingAssessment, 
  useTrainingAssessments, 
  useCreateTrainingAssessment, 
  useUpdateTrainingAssessment, 
  useDeleteTrainingAssessment,
  useAssignAssessmentToSession
} from "@/lib/hooks/useTrainingAssessment"
import { ColumnDef } from "@tanstack/react-table"
import { catAssessmentColumns, createActionsColumn } from "./cat-columns"
import { CatDataTable } from "./cat-data-table"
import { CatFormModal } from "./cat-form-modal"
import { CatAssignSessionModal } from "./cat-assign-session-modal"
import { DeleteCatAssessmentDialog } from "./delete-cat-assessment-dialog"

interface CatViewProps {
  trainingId: string
}

export function CatView({ trainingId }: CatViewProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assessmentToDelete, setAssessmentToDelete] = useState<TrainingAssessment | null>(null)
  const [assignSessionModalOpen, setAssignSessionModalOpen] = useState(false)
  const [assessmentToAssign, setAssessmentToAssign] = useState<TrainingAssessment | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  const { 
    isProjectManager, 
    isTrainingAdmin, 
    isCompanyAdmin, 
    isCurriculumAdmin 
  } = useUserRole()
  
  const { data, isLoading } = useTrainingAssessments(trainingId)
  const createAssessmentMutation = useCreateTrainingAssessment()
  const updateAssessmentMutation = useUpdateTrainingAssessment()
  const deleteAssessmentMutation = useDeleteTrainingAssessment()

  // Check if user has permissions to edit
  const hasEditPermission = useMemo(() => {
    return isCompanyAdmin || isProjectManager || isTrainingAdmin || isCurriculumAdmin
  }, [isCompanyAdmin, isProjectManager, isTrainingAdmin, isCurriculumAdmin])

  // Check if user can add/edit assessments (everyone except Training Admin)
  const canAddEditAssessments = useMemo(() => {
    return isCompanyAdmin || isProjectManager || isCurriculumAdmin
  }, [isCompanyAdmin, isProjectManager, isCurriculumAdmin])

  const handleAddAssessment = useCallback(() => {
    if (!canAddEditAssessments) return;
    setShowModal(true)
    setIsEditing(false)
    setCurrentAssessmentId(null)
  }, [canAddEditAssessments])
  
  const handleEditAssessment = useCallback((assessment: TrainingAssessment) => {
    if (!canAddEditAssessments) return;
    setCurrentAssessmentId(assessment.id)
    setIsEditing(true)
    setShowModal(true)
  }, [canAddEditAssessments])
  
  const handleDeleteAssessment = useCallback((assessment: TrainingAssessment) => {
    if (!canAddEditAssessments) return;
    setAssessmentToDelete(assessment)
    setDeleteDialogOpen(true)
  }, [canAddEditAssessments])

  const handleAssignSession = useCallback((assessment: TrainingAssessment) => {
    // Only company admin, project manager, and training admin can assign sessions (not curriculum admin)
    if (isCurriculumAdmin) return;
    setAssessmentToAssign(assessment)
    setAssignSessionModalOpen(true)
  }, [isCurriculumAdmin])
  
  const confirmDelete = useCallback(async () => {
    if (assessmentToDelete) {
      try {
        await deleteAssessmentMutation.mutateAsync(assessmentToDelete.id)
        setDeleteDialogOpen(false)
        setAssessmentToDelete(null)
      } catch (error) {
        console.error("Delete failed:", error)
      }
    }
  }, [deleteAssessmentMutation, assessmentToDelete])
  
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const handleSubmitAssessment = useCallback(async (assessmentData: { name: string; description: string; fileLink: string }) => {
    try {
      if (isEditing && currentAssessmentId) {
        await updateAssessmentMutation.mutateAsync({
          assessmentId: currentAssessmentId,
          assessmentData
        })
      } else {
        await createAssessmentMutation.mutateAsync({
          trainingId,
          assessmentData
        })
      }
      setShowModal(false)
    } catch (error) {
      console.error("Submission failed:", error)
    }
  }, [createAssessmentMutation, currentAssessmentId, isEditing, trainingId, updateAssessmentMutation])

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }, [])

  // Memoize filtered and paginated assessments data
  const { 
    filteredAssessments, 
    paginatedAssessments,
    totalElements,
    totalPages 
  } = useMemo(() => {
    const filtered = data?.trainingAssessments?.filter(assessment => 
      assessment?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      assessment?.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) || []

    const total = filtered.length || 0
    const totalPgs = Math.ceil(total / pageSize)
    
    const paginated = filtered.slice(
      (page - 1) * pageSize,
      page * pageSize
    ) || []

    return {
      filteredAssessments: filtered,
      paginatedAssessments: paginated,
      totalElements: total,
      totalPages: totalPgs
    }
  }, [data?.trainingAssessments, debouncedSearch, page, pageSize])

  // Add the actions column to the existing columns
  const columnsWithActions = useMemo<ColumnDef<TrainingAssessment>[]>(() => {
    // Get the base columns
    const columns = [...catAssessmentColumns]
    
    // Add the actions column only if user has appropriate permissions
    const hasEditPermission = isCompanyAdmin || isProjectManager || isTrainingAdmin || isCurriculumAdmin
    
    if (hasEditPermission) {
      columns.push(createActionsColumn(
        handleEditAssessment, 
        handleDeleteAssessment, 
        handleAssignSession, 
        hasEditPermission,
        isTrainingAdmin,
        isCurriculumAdmin
      ))
    }
    
    return columns
  }, [
    handleEditAssessment, 
    handleDeleteAssessment, 
    handleAssignSession, 
    isCompanyAdmin, 
    isProjectManager, 
    isTrainingAdmin,
    isCurriculumAdmin
  ])

  const emptyState = useMemo(() => (
        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No CAT Assessments Added Yet</h3>
          <p className="text-gray-500 text-sm">
            Add CAT assessments to help evaluate your training program.
          </p>
          {canAddEditAssessments && (
            <Button
              className="mt-4 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
              onClick={handleAddAssessment}
            >
              Add Assessment
            </Button>
          )}
        </div>
  ), [handleAddAssessment, canAddEditAssessments])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <h1 className="text-lg font-semibold mb-6">CAT Assessments</h1>

        {!data?.trainingAssessments?.length ? (
          emptyState
        ) : (
          <>
            <div className="flex items-center lg:justify-end gap-3 mb-6">
              <div className="relative md:w-[300px]">
                <Image
                  src="/search.svg"
                  alt="Search"
                  width={19}
                  height={19}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5 z-10"
                />
                <Input
                  placeholder="Search assessments..."
                  className="pl-10 h-10 text-sm bg-white border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {canAddEditAssessments && (
                <Button
                  className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
                  onClick={handleAddAssessment}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Assessment</span>
                </Button>
              )}
            </div>

            <CatDataTable
              columns={columnsWithActions}
              data={paginatedAssessments}
              isLoading={isLoading}
              pagination={{
                totalPages,
                currentPage: page,
                setPage,
                pageSize,
                setPageSize: handlePageSizeChange,
                totalElements,
              }}
            />
          </>
        )}

        {/* Add/Edit Assessment Modal */}
        {showModal && canAddEditAssessments && (
          <CatFormModal
            isOpen={showModal}
            onClose={handleCloseModal}
            isEditing={isEditing}
            assessment={isEditing ? data?.trainingAssessments?.find(a => a.id === currentAssessmentId) || null : null}
            isSubmitting={isEditing ? updateAssessmentMutation.isPending : createAssessmentMutation.isPending}
            onSubmit={handleSubmitAssessment}
          />
        )}

        {/* Delete Assessment Dialog */}
        {deleteDialogOpen && canAddEditAssessments && (
          <DeleteCatAssessmentDialog
            isOpen={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            assessment={assessmentToDelete}
            onConfirmDelete={confirmDelete}
            isDeleting={deleteAssessmentMutation.isPending}
          />
        )}

        {/* Assign Session Modal */}
        {assignSessionModalOpen && !isCurriculumAdmin && (
          <CatAssignSessionModal
            isOpen={assignSessionModalOpen}
            onClose={() => setAssignSessionModalOpen(false)}
            assessment={assessmentToAssign}
          />
        )}
      </div>
    </div>
  )
}
