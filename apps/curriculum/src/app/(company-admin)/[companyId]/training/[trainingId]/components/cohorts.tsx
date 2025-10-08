"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useCohorts } from "@/lib/hooks/useCohorts"
import { Input } from "@/components/ui/input"
import { CohortList } from "./cohorts/cohort-list"
import { CohortForm } from "./cohorts/cohort-form"
import { CohortFilter, CohortFilters } from "./cohorts/cohort-filter"
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"

interface CohortsComponentProps {
  trainingId: string
}

export function CohortsComponent({ trainingId }: CohortsComponentProps) {
  const router = useRouter()
  const params = useParams()
  const { isProjectManager, isTrainingAdmin } = useUserRole()
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<CohortFilters>({})
  
  // Modal state
  const [isAddCohortModalOpen, setIsAddCohortModalOpen] = useState(false)
  const [isEditCohortModalOpen, setIsEditCohortModalOpen] = useState(false)
  const [cohortToEdit, setCohortToEdit] = useState<any>(null)
  
  // Build API query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      trainingId,
      page,
      pageSize,
    }
    
    if (searchTerm.trim()) {
      params.searchQuery = searchTerm.trim()
    }
    
    if (filters.name) {
      params.name = filters.name
    }
    
    if (filters.tags && filters.tags.length > 0) {
      params.tags = filters.tags
    }
    
    if (filters.createdAtFrom) {
      params.createdAtFrom = filters.createdAtFrom.toISOString()
    }
    
    if (filters.createdAtTo) {
      params.createdAtTo = filters.createdAtTo.toISOString()
    }
    
    return params
  }, [trainingId, page, pageSize, searchTerm, filters])
  
  const { data, isLoading, error } = useCohorts(queryParams)
  
  const cohorts = data?.cohorts || []
  const totalPages = data?.totalPages || 0
  const totalElements = data?.totalElements || 0

  const handleAddCohort = () => {
    setIsAddCohortModalOpen(true)
  }

  const handleCohortSuccess = () => {
    setIsAddCohortModalOpen(false)
    // The query will automatically refetch due to invalidation in the hook
  }

  const handleCohortCancel = () => {
    setIsAddCohortModalOpen(false)
  }

  const handleEditCohort = (cohort: typeof cohorts[0]) => {
    setCohortToEdit(cohort)
    setIsEditCohortModalOpen(true)
  }

  const handleEditCohortSuccess = () => {
    setIsEditCohortModalOpen(false)
    setCohortToEdit(null)
    // The query will automatically refetch due to invalidation in the hook
  }

  const handleEditCohortCancel = () => {
    setIsEditCohortModalOpen(false)
    setCohortToEdit(null)
  }

  const handleFiltersChange = (newFilters: CohortFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setPage(1) // Reset to first page when page size changes
  }

  // Extract all unique tags from cohorts for filter dropdown
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>()
    cohorts.forEach(cohort => {
      cohort.tags?.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }, [cohorts])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <div className="flex lg:px-16 md:px-14 px-4 w-full">
        <div className="flex-1 py-4 md:pl-12 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold">Cohorts</h1>
            <div className="flex items-center gap-4">
              <div className="relative md:w-[300px]">
                <Image
                  src="/search.svg"
                  alt="Search"
                  width={19}
                  height={19}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5 z-10"
                />
                <Input
                  type="text"
                  placeholder="Search cohorts..."
                  className="pl-10 h-10 text-sm bg-white border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <CohortFilter
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableTags={availableTags}
              />
              {(isProjectManager || isTrainingAdmin) && (
                <Button
                  className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 h-10"
                  onClick={handleAddCohort}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Cohort</span>
                </Button>
              )}
            </div>
          </div>

          {error ? (
            <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
              <h3 className="text-lg font-medium mb-2">Error Loading Cohorts</h3>
              <p className="text-gray-500 text-sm">
                There was a problem loading the cohorts. Please try again later.
              </p>
            </div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
              <h3 className="text-lg font-medium mb-2">No Cohorts Added Yet</h3>
              <p className="text-gray-500 text-sm">
                Add cohorts to organize your training sessions and students.
              </p>
              {(isProjectManager || isTrainingAdmin) && (
                <Button 
                  className="mt-4 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 mx-auto"
                  onClick={handleAddCohort}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Cohort</span>
                </Button>
              )}
            </div>
          ) : (
            <>
              <CohortList cohorts={cohorts} onEditCohort={handleEditCohort} />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((page - 1) * pageSize) + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(page * pageSize, totalElements)}
                      </span>{" "}
                      of <span className="font-medium">{totalElements}</span> cohorts
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Rows per page:</span>
                      <Select
                        value={pageSize.toString()}
                        onValueChange={handlePageSizeChange}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-700">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Cohort Modal */}
      <Dialog open={isAddCohortModalOpen} onOpenChange={setIsAddCohortModalOpen}>
        <DialogContent 
          className="sm:max-w-[600px] max-h-[90vh] p-0"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-xl font-semibold">New Cohort</DialogTitle>
              {/* <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose> */}
            </div>
          </DialogHeader>
          <CohortForm 
            trainingId={trainingId}
            companyId={params.companyId as string}
            onSuccess={handleCohortSuccess}
            onCancel={handleCohortCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Cohort Modal */}
      <Dialog open={isEditCohortModalOpen} onOpenChange={setIsEditCohortModalOpen}>
        <DialogContent 
          className="sm:max-w-[600px] max-h-[90vh] p-0"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-xl font-semibold">Edit Cohort</DialogTitle>
              {/* <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose> */}
            </div>
          </DialogHeader>
          <CohortForm 
            trainingId={trainingId}
            companyId={params.companyId as string}
            cohort={cohortToEdit}
            isEditing={true}
            onSuccess={handleEditCohortSuccess}
            onCancel={handleEditCohortCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  )
} 