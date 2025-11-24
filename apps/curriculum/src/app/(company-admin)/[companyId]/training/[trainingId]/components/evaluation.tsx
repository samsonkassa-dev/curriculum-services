"use client"

import { useReducer, useMemo, useCallback, useEffect } from "react"
import { Loading } from "@/components/ui/loading"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { useGetEvaluations, useCreateEvaluation } from "@/lib/hooks/useEvaluation"
import { EvaluationSummary } from "@/lib/hooks/evaluation-types"
import { CreateEvaluationForm } from "./evaluation/components/CreateEvaluationForm"
import { EvaluationDataTable } from "./evaluation/components/evaluation-data-table"
import { evaluationColumns, createEvaluationActionsColumn } from "./evaluation/components/evaluation-columns"
import { EvaluationHeader } from "./evaluation/components/evaluation-header"
import { DefaultCreate } from "./defaultCreate"
// Removed unused imports - using EvaluationHeader component now

interface EvaluationComponentProps {
  trainingId: string
}

// State management with useReducer (Mirroring Assessment)
type EvaluationState = {
  showCreateForm: boolean
  searchQuery: string
  currentPage: number
  pageSize: number
  editingForm: EvaluationSummary | null
}

type EvaluationAction =
  | { type: 'SHOW_CREATE_FORM' }
  | { type: 'HIDE_CREATE_FORM' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'START_EDIT'; payload: EvaluationSummary }

const initialState: EvaluationState = {
  showCreateForm: false,
  searchQuery: "",
  currentPage: 1,
  pageSize: 10,
  editingForm: null,
}

function evaluationReducer(state: EvaluationState, action: EvaluationAction): EvaluationState {
  switch (action.type) {
    case 'SHOW_CREATE_FORM':
      return { ...state, showCreateForm: true }
    case 'HIDE_CREATE_FORM':
      return { ...state, showCreateForm: false, editingForm: null }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, currentPage: 1 } // Reset page on search
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload }
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, currentPage: 1 }
    case 'START_EDIT':
      return { ...state, editingForm: action.payload, showCreateForm: true }
    default:
      return state
  }
}

export function EvaluationComponent({ trainingId }: EvaluationComponentProps) {
  const [state, dispatch] = useReducer(evaluationReducer, initialState)
  const { isProjectManager, isTrainingAdmin, isCompanyAdmin, isCurriculumAdmin, isMeExpert } = useUserRole()
  
  // Fetch evaluations
  const { data, isLoading } = useGetEvaluations(trainingId)
  
  // Transform API data to Summary type if needed
  // The API returns `monitoringForm` array. We map it to EvaluationSummary.
  const evaluations: EvaluationSummary[] = useMemo(() => {
    if (!data?.monitoringForm) return []
    return data.monitoringForm.map((form: any) => ({
      id: form.id,
      formType: form.formType,
      createdAt: form.createdAt,
      name: form.name || `${form.formType === 'PRE' ? 'Pre' : form.formType === 'MID' ? 'Mid' : 'Post'} Training Evaluation`,
      description: form.description || "",
      entryCount: form.monitoringFormEntries?.length || 0,
      status: "ACTIVE" // Defaulting for now
    }))
  }, [data])

  // Filtering
  const filteredEvaluations = useMemo(() => {
    if (!state.searchQuery.trim()) return evaluations
    const query = state.searchQuery.toLowerCase()
    return evaluations.filter(e => 
      e.name.toLowerCase().includes(query) || 
      e.formType.toLowerCase().includes(query)
    )
  }, [evaluations, state.searchQuery])

  // Pagination
  const paginatedEvaluations = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.pageSize
    const endIndex = startIndex + state.pageSize
    return filteredEvaluations.slice(startIndex, endIndex)
  }, [filteredEvaluations, state.currentPage, state.pageSize])

  const totalPages = Math.ceil(filteredEvaluations.length / state.pageSize)

  // Reset to page 1 when search changes
  useEffect(() => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: 1 })
  }, [state.searchQuery])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: newPageSize })
  }, [])

  // Handlers
  const handleCreateNew = useCallback(() => {
    dispatch({ type: 'SHOW_CREATE_FORM' })
  }, [])

  const handleBackToList = useCallback(() => {
    dispatch({ type: 'HIDE_CREATE_FORM' })
  }, [])

  const handleView = useCallback((form: EvaluationSummary) => {
    // TODO: Implement view modal
    console.log("View", form)
  }, [])

  const handleEdit = useCallback((form: EvaluationSummary) => {
    // TODO: Implement edit logic
    // dispatch({ type: 'START_EDIT', payload: form })
    console.log("Edit not implemented yet", form)
  }, [])

  const handleDelete = useCallback((form: EvaluationSummary) => {
    // TODO: Implement delete logic
    console.log("Delete", form)
  }, [])

  // Columns
  const columns = useMemo(() => [
    ...evaluationColumns,
    createEvaluationActionsColumn(handleView, handleEdit, handleDelete)
  ], [handleView, handleEdit, handleDelete])

  // Permission logic for evaluations (ME Expert handles evaluations)
  const canCreateEvaluations = useMemo(() => {
    return isCompanyAdmin || isProjectManager || isCurriculumAdmin || isTrainingAdmin || isMeExpert
  }, [isCompanyAdmin, isProjectManager, isCurriculumAdmin, isTrainingAdmin, isMeExpert])

  if (isLoading) {
    return <Loading />
  }

  if (state.showCreateForm) {
    return (
      <CreateEvaluationForm 
        trainingId={trainingId}
        onCancel={handleBackToList}
      />
    )
  }

  // No evaluations view
  if (evaluations.length === 0) {
    return (
      <DefaultCreate
        title="Create Evaluation"
        trainingId={trainingId}
        onCreateClick={handleCreateNew}
      />
    )
  }

  // Show evaluations list (matching assessment structure)
  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <EvaluationHeader
          searchQuery={state.searchQuery}
          onSearchChange={(value) => dispatch({ type: 'SET_SEARCH_QUERY', payload: value })}
          onCreateNew={handleCreateNew}
          canCreateEvaluations={canCreateEvaluations}
        />

        {/* Evaluations Table */}
        <EvaluationDataTable 
          columns={columns} 
          data={paginatedEvaluations}
          isLoading={isLoading}
          pagination={{
              currentPage: state.currentPage,
              totalPages,
              setPage: (page) => dispatch({ type: 'SET_CURRENT_PAGE', payload: page }),
              pageSize: state.pageSize,
              setPageSize: handlePageSizeChange,
              totalElements: filteredEvaluations.length
          }}
        />
      </div>
    </div>
  )
}
