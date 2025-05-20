"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useTrainers, Trainer } from "@/lib/hooks/useTrainers"
import { Loading } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { TrainerDataTable } from "./components/trainer-data-table" 
import { createColumns } from "./components/columns"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { useBaseData } from "@/lib/hooks/useBaseData"
import Image from 'next/image'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

export default function TrainersPage() {
  const params = useParams()
  const companyId = params.companyId as string
  const { isTrainerAdmin, isProjectManager } = useUserRole()
  const { data: languages } = useBaseData('language')
  const { data: academicLevels } = useBaseData('academic-level')
  const { data: trainingTags } = useBaseData('training-tag')

  const [page, setPage] = useState<number>(DEFAULT_PAGE)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Note: useTrainers hook seems to fetch paginated data server-side based on its args (currentPage, pageSize)
  // We will perform client-side filtering *on top* of the fetched page for now.
  // Ideally, the `debouncedSearch` would be passed to `useTrainers` for server-side search.
  const { data: trainersData, isLoading, error } = useTrainers(page, pageSize)

  // Extract trainers list and pagination info, provide defaults
  const allFetchedTrainers = trainersData?.trainers || []

  const filteredTrainers = allFetchedTrainers.filter(trainer => 
    trainer?.firstName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    trainer?.lastName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    trainer?.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || []

  // Recalculate pagination based on filtered results
  const totalElements = filteredTrainers.length 
  const totalPages = Math.ceil(totalElements / pageSize)

  if (page > totalPages && totalPages > 0) {
     setPage(1); 
  }
  
  // Get the data for the current page from the filtered list
   const paginatedTrainers = filteredTrainers.slice(
     (page - 1) * pageSize,
     page * pageSize
   )

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    // Optional: Scroll to top or handle other side effects
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(DEFAULT_PAGE) // Reset to first page on size change
  }

  const paginationProps = {
    totalPages,
    currentPage: page,
    setPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalElements // Pass total *filtered* elements
  }
  
  // Construct the add trainer link - change /create to /add
  const addTrainerHref = `/${companyId}/trainers/add`

  const handleViewTrainer = (trainer: Trainer) => {
    // Will be implemented with modal
  }

  const handleEditTrainer = (trainer: Trainer) => {
    // Will be implemented with modal
  }

  const handleDeleteTrainer = (trainer: Trainer) => {
    // Will be implemented with modal
  }

  const columns = createColumns(handleViewTrainer, handleEditTrainer, handleDeleteTrainer)

  if (isLoading && !trainersData) { // Show loading only on initial load
    return <Loading />
  }

  if (error) {
    // Handle error state appropriately, e.g., show an error message
    return <div className="text-center text-red-500 p-4">Error loading trainers: {error.message}</div>
  }

  // Empty State 
  if (!isLoading && allFetchedTrainers.length === 0 && debouncedSearch === "") {
    return (
      <div className="flex lg:px-16 md:px-14 px-4 w-full">
        <div className="flex-1 py-4 md:pl-12 min-w-0">
          <h1 className="text-lg font-normal mb-6">Trainers</h1>
          {isTrainerAdmin && (
            <Button asChild className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 mb-6">
              <Link href={addTrainerHref}>
                <Plus className="h-4 w-4" />
                <span>Add Trainer</span>
              </Link>
            </Button>
          )}
          <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
            <h3 className="text-lg font-medium mb-2">No Trainers Added Yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              Add trainers to manage their details and assign them to training programs.
            </p>
            {isTrainerAdmin && (
              <Button asChild className="mt-4 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white">
                <Link href={addTrainerHref}>
                  Add Trainer
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Data Present State - Matching the jobs page layout
  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <h1 className="text-lg font-normal mb-6">Trainers</h1>

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
              placeholder="Search trainers..."
              className="pl-10 h-10 bg-white border-gray-200 rounded-lg"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to page 1 when search query changes
              }}
            />
          </div>
          {isTrainerAdmin || isProjectManager && (
            <Button asChild className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2">
              <Link href={addTrainerHref}>
                <Plus className="h-4 w-4" />
                <span>Add Trainer</span>
              </Link>
            </Button>
          )}
        </div>
        
        {/* Use the TrainerDataTable */}
        <TrainerDataTable
          data={paginatedTrainers}
          isLoading={isLoading}
          pagination={paginationProps}
          languages={languages || []}
          academicLevels={academicLevels || []}
          trainingTags={trainingTags || []}
        />
      </div>
    </div>
  )
}