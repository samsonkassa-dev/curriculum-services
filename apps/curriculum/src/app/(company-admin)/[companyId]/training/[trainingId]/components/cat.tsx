"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { useCat, useTrainingAssessments, useAssessment } from "@/lib/hooks/useCat"
import { Plus, ClipboardList } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { assessmentColumns, createActionsColumn } from "./cat/cat-columns"
import { CatDataTable } from "./cat/cat-data-table"
import { DeleteCatDialog } from "./cat/delete-cat-dialog"
import { toast } from "sonner"
import { ColumnDef } from "@tanstack/react-table"
import { AddCatDialog } from "./cat/add-cat-dialog"
import { EditCatDialog } from "./cat/edit-cat-dialog"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"

// Type definitions
export interface Assessment {
  id: string;
  name: string;
  description: string;
  assessmentLevel: 'TRAINING' | 'MODULE' | 'LESSON';
  assessmentType: {
    id: string;
    name: string;
    description: string;
    assessmentSubType: string;
  };
  trainingTitle: string;
  moduleName: string | null;
  lessonName: string | null;
}

interface CatComponentProps {
  trainingId: string
}

export function CatComponent({ trainingId }: CatComponentProps) {
  // State variables
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 500)
  const params = useParams()
  const companyId = params.companyId as string
  
  // Hooks
  const { isProjectManager, isTrainingAdmin, isCompanyAdmin, isCurriculumAdmin } = useUserRole()
  const { deleteAssessment, isDeleteLoading } = useCat()
  const { 
    data: assessmentsData, 
    isLoading,
    error 
  } = useTrainingAssessments(trainingId, page, pageSize)

  // Extract assessments from data
  const assessments = useMemo(() => {
    return assessmentsData?.assessments || []
  }, [assessmentsData])
  
  // Track total count for pagination
  const totalCount = useMemo(() => {
    return assessments.length || 0
  }, [assessments])
  
  // Handle edit assessment
  const handleEditAssessment = useCallback((assessment: Assessment) => {
    setCurrentAssessmentId(assessment.id)
    setEditDialogOpen(true)
  }, [])
  
  // Handle closing the edit dialog
  const handleEditDialogChange = useCallback((open: boolean) => {
    setEditDialogOpen(open)
    // Clear the assessment ID if the dialog is being closed
    if (!open) {
      setTimeout(() => {
        setCurrentAssessmentId(null)
      }, 300) // Wait for dialog close animation
    }
  }, [])
  
  const handleDeleteAssessment = useCallback((assessment: Assessment) => {
    setAssessmentToDelete(assessment)
    setDeleteDialogOpen(true)
  }, [])
  
  const confirmDelete = useCallback(async () => {
    if (assessmentToDelete) {
      try {
        await deleteAssessment(assessmentToDelete.id, {
          onSuccess: () => {
            setDeleteDialogOpen(false)
            setAssessmentToDelete(null)
            toast.success("Assessment deleted successfully")
          },
          onError: (error) => {
            toast.error("Failed to delete assessment")
          }
        })
      } catch (error) {
        toast.error("Failed to delete assessment")
      }
    }
  }, [assessmentToDelete, deleteAssessment])

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }, [])

  // Filter assessments by search query
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment =>
      assessment.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      assessment.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (assessment.moduleName && assessment.moduleName.toLowerCase().includes(debouncedSearch.toLowerCase()))
    )
  }, [assessments, debouncedSearch])

  // Pagination
  const totalPages = useMemo(() => Math.ceil(filteredAssessments.length / pageSize), [filteredAssessments.length, pageSize])
  
  const paginatedAssessments = useMemo(() => {
    return filteredAssessments.slice(
      (page - 1) * pageSize,
      page * pageSize
    )
  }, [filteredAssessments, page, pageSize])

  // Add actions column based on user permissions
  const columnsWithActions = useMemo<ColumnDef<Assessment>[]>(() => {
    const columns = [...assessmentColumns]
    const hasEditPermission = isCompanyAdmin || isProjectManager || isTrainingAdmin || isCurriculumAdmin
    
    if (hasEditPermission) {
      columns.push(createActionsColumn(handleEditAssessment, handleDeleteAssessment, hasEditPermission))
    }
    
    return columns
  }, [handleEditAssessment, handleDeleteAssessment, isCompanyAdmin, isProjectManager, isTrainingAdmin, isCurriculumAdmin])

  // Check if user has permissions to edit
  const hasEditPermission = useMemo(() => {
    return isCompanyAdmin || isProjectManager || isTrainingAdmin || isCurriculumAdmin
  }, [isCompanyAdmin, isProjectManager, isTrainingAdmin, isCurriculumAdmin])

  // Empty state
  const emptyState = useMemo(() => (
    <Card className="p-8 text-center">
      <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-medium mb-2">No CAT Assessments Available</h3>
      <p className="text-gray-500 mb-6">
        Course Assessment Tools (CAT) help assess training impact and learner progress. They enable trainers to evaluate effectiveness and make data-driven improvements to curriculum delivery.
      </p>
      {hasEditPermission && (
        <AddCatDialog
          trainingId={trainingId} 
          companyId={companyId}
          trigger={
            <Button className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white">
              Add Assessment
            </Button>
          }
        />
      )}
    </Card>
  ), [hasEditPermission, trainingId, companyId])

  if (isLoading && !assessments.length) {
    return <Loading />
  }

  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <h1 className="text-lg font-semibold mb-6">Course Assessment Tool</h1>

        {!assessments.length ? (
          <div className="px-[7%] py-8">
            {emptyState}
          </div>
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
              {hasEditPermission && (
                <AddCatDialog
                  trainingId={trainingId}
                  companyId={companyId}
                  trigger={
                    <Button className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Assessment</span>
                    </Button>
                  }
                />
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
                totalElements: filteredAssessments.length,
              }}
            />
          </>
        )}

        {/* Edit Assessment Dialog */}
        {currentAssessmentId && (
          <EditCatDialog
            isOpen={editDialogOpen}
            onOpenChange={handleEditDialogChange}
            assessmentId={currentAssessmentId}
            trainingId={trainingId}
            companyId={companyId}
          />
        )}

        {/* Delete Assessment Dialog */}
        <DeleteCatDialog
          isOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          assessment={assessmentToDelete}
          onConfirmDelete={confirmDelete}
          isDeleting={isDeleteLoading}
        />
      </div>
    </div>
  )
}
