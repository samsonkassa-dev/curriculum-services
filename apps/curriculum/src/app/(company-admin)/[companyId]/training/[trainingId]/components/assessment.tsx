"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Loading } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Plus, Filter } from "lucide-react"
import Image from "next/image"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { useCreateAssessment, useAssessments, AssessmentSummary } from "@/lib/hooks/useAssessment"
import { CreateAssessmentForm, type CreateAssessmentData } from "./assessment/index"
import { AssessmentDataTable } from "./assessment/components/assessment-data-table"
import { createAssessmentColumnsWithActions } from "./assessment/components/assessment-columns"
import { AssessmentViewModal } from "./assessment/components/AssessmentViewModal"
import { DefaultCreate } from "./defaultCreate"

interface AssessmentComponentProps {
  trainingId: string
}

export function AssessmentComponent({ trainingId }: AssessmentComponentProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentSummary | null>(null)
  const [editingAssessment, setEditingAssessment] = useState<AssessmentSummary | null>(null)
  
  const { isProjectManager, isTrainingAdmin, isCompanyAdmin } = useUserRole()
  
  // Fetch assessments for this training
  const { data: assessmentsData, isLoading } = useAssessments(trainingId)
  const createAssessment = useCreateAssessment()

  const assessments = assessmentsData?.assessments || []
  
  // Filter assessments based on search query
  const filteredAssessments = useMemo(() => {
    if (!searchQuery.trim()) return assessments
    
    return assessments.filter(assessment => 
      assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [assessments, searchQuery])

  // Client-side pagination
  const paginatedAssessments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAssessments.slice(startIndex, endIndex)
  }, [filteredAssessments, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAssessments.length / pageSize)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }, [])

  const handleCreateNew = useCallback(() => {
    setShowCreateForm(true)
  }, [])

  const handleBackToList = useCallback(() => {
    setShowCreateForm(false)
    setEditingAssessment(null)
  }, [])

  const handleSubmit = useCallback((data: CreateAssessmentData) => {
    setIsSubmitting(true)
    createAssessment.mutate(
      { trainingId, data },
      {
        onSuccess: () => {
          setIsSubmitting(false)
          setShowCreateForm(false)
          toast.success("Assessment created successfully")
        },
        onError: () => {
          setIsSubmitting(false)
        }
      }
    )
  }, [createAssessment, trainingId])

  // Action handlers
  const handleViewAssessment = useCallback((assessment: AssessmentSummary) => {
    setSelectedAssessment(assessment)
    setViewModalOpen(true)
  }, [])

  const handleEditAssessment = useCallback((assessment: AssessmentSummary) => {
    setEditingAssessment(assessment)
    setShowCreateForm(true)
  }, [])

  const handleAssessmentSettings = useCallback((assessment: AssessmentSummary) => {
    // TODO: Open assessment settings modal
    console.log("Assessment settings:", assessment)
  }, [])

  const handleDeleteAssessment = useCallback((assessment: AssessmentSummary) => {
    // TODO: Open delete confirmation dialog
    console.log("Delete assessment:", assessment)
  }, [])

  // Check if user has edit permissions
  const hasEditPermission = useMemo(() => {
    return isCompanyAdmin || isProjectManager || isTrainingAdmin
  }, [isCompanyAdmin, isProjectManager, isTrainingAdmin])

  // Create columns with actions
  const columnsWithActions = useMemo(() => {
    return createAssessmentColumnsWithActions(
      handleViewAssessment,
      handleEditAssessment,
      handleAssessmentSettings,
      handleDeleteAssessment,
      hasEditPermission
    )
  }, [handleViewAssessment, handleEditAssessment, handleAssessmentSettings, handleDeleteAssessment, hasEditPermission])

  // Show loading for initial data fetch
  if (isLoading) {
    return <Loading />
  }

  // Show create form if explicitly requested
  if (showCreateForm) {
    return (
      <CreateAssessmentForm
        trainingId={trainingId}
        onCancel={handleBackToList}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting || createAssessment.isPending}
        editingAssessment={editingAssessment}
      />
    )
  }

  // Show default create view if no assessments exist
  if (assessments.length === 0) {
    return (
      <DefaultCreate
        title="Create Assessment"
        trainingId={trainingId}
        onCreateClick={handleCreateNew}
      />
    )
  }

  // Show assessments list
  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <h1 className="text-lg font-semibold mb-6">Assessment</h1>

        {/* Search and Actions - Same row layout as students */}
        <div className="flex items-center lg:justify-end gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative md:w-[300px]">
              <Image
                src="/search.svg"
                alt="Search"
                width={19}
                height={19}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5 z-10"
              />
              <Input
                placeholder="Search"
                className="pl-10 h-10 text-sm bg-white border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          
          {hasEditPermission && (
            <Button
              onClick={handleCreateNew}
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Assessment</span>
            </Button>
          )}
        </div>

        {/* Assessments Table */}
        <AssessmentDataTable
          columns={columnsWithActions}
          data={paginatedAssessments}
          isLoading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            setPage: setCurrentPage,
            pageSize,
            setPageSize: handlePageSizeChange,
            totalElements: filteredAssessments.length,
          }}
        />

        {/* Assessment View Modal */}
        <AssessmentViewModal
          assessment={selectedAssessment}
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false)
            setSelectedAssessment(null)
          }}
        />
      </div>
    </div>
  )
}


