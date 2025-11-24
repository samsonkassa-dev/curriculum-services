"use client"

import { useReducer, useMemo, useCallback, useEffect } from "react"
import { Loading } from "@/components/ui/loading"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { useGetEvaluations, useCreateEvaluation } from "@/lib/hooks/useEvaluation"
import { EvaluationSummary } from "@/lib/hooks/evaluation-types"
import { CreateEvaluationForm } from "./evaluation/components/CreateEvaluationForm"
import { EvaluationDataTable } from "./evaluation/components/evaluation-data-table"
import { evaluationColumns, createEvaluationActionsColumn } from "./evaluation/components/evaluation-columns"
import { Button } from "@/components/ui/button"
import { Plus, Eye, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

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
  const { isProjectManager, isCompanyAdmin } = useUserRole()
  
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

  const canCreate = isProjectManager || isCompanyAdmin

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

  // Empty State (only if truly empty, not just filtered)
  if (evaluations.length === 0 && !state.searchQuery) {
    return (
      <div className="px-[7%] py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold">Evaluation Forms</h1>
          {canCreate && (
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4" />
              <span>Create Form</span>
            </Button>
          )}
        </div>
        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Evaluation Forms Created</h3>
          <p className="text-gray-500 text-sm">
            Create evaluation forms to assess training effectiveness.
          </p>
          {canCreate && (
            <Button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleCreateNew}
            >
              Create Form
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="px-[7%] py-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h1 className="text-xl font-semibold">Evaluation Forms</h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-[280px]">
                <Image
                    src="/search.svg"
                    alt="Search"
                    width={19}
                    height={19}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5 z-10"
                />
                <Input
                    placeholder="Search evaluations..."
                    className="pl-10 h-10 text-sm bg-white border-gray-200 w-full"
                    value={state.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                />
            </div>

            {canCreate && (
                <Button 
                    className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
                    onClick={handleCreateNew}
                >
                    <Plus className="h-4 w-4" />
                    <span>Create Form</span>
                </Button>
            )}
        </div>
      </div>

      <EvaluationDataTable 
        columns={columns} 
        data={paginatedEvaluations}
        pagination={{
            currentPage: state.currentPage,
            totalPages,
            setPage: (p) => dispatch({ type: 'SET_CURRENT_PAGE', payload: p }),
            pageSize: state.pageSize,
            setPageSize: (s) => dispatch({ type: 'SET_PAGE_SIZE', payload: s }),
            totalElements: filteredEvaluations.length
        }}
      />
    </div>
  )
}
