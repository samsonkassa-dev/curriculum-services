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
// Import the new specific data table
import { TrainerDataTable } from "./components/trainer-data-table" 
import { columns } from "./components/columns"
import { useUserRole } from "@/lib/hooks/useUserRole"

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

export default function TrainersPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.companyId as string
  const { isTrainerAdmin } = useUserRole()

  const [page, setPage] = useState<number>(DEFAULT_PAGE) // Renamed for clarity with pagination component
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

  if (isLoading && !trainersData) { // Show loading only on initial load
    return <Loading />
  }

  if (error) {
    // Handle error state appropriately, e.g., show an error message
    return <div className="text-center text-red-500 p-4">Error loading trainers: {error.message}</div>
  }

  // Empty State (Figma Node: 121-4235) - Check based on *all* fetched trainers before filtering
  if (!isLoading && allFetchedTrainers.length === 0 && debouncedSearch === "") {
    return (
      <div className="px-[7%] py-10">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-xl font-semibold">Trainers</h1>
           {/* Add button only shown to trainer admins */}
           {isTrainerAdmin && (
             <Button asChild className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2">
               <Link href={addTrainerHref}>
                 <Plus className="h-4 w-4" />
                 <span>Add Trainer</span>
               </Link>
             </Button>
           )}
        </div>
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
    )
  }

  // Data Present State (Figma Node: 108-27468)
  return (
    <div className="px-[8%] md:pr-14 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Trainers</h1>
        {isTrainerAdmin && (
          <Button asChild className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2">
            <Link href={addTrainerHref}>
              <Plus className="h-4 w-4" />
              <span>Add Trainer</span>
            </Link>
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="relative md:w-[300px]">
          <Search className="absolute text-sm left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search trainers..."
            className="pl-10 h-10 text-sm bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to page 1 when search query changes
            }}
          />
        </div>
      </div>
      
      {/* Use the new TrainerDataTable */}
      <TrainerDataTable
        columns={columns}
        data={paginatedTrainers} // Pass paginated *filtered* data
        isLoading={isLoading} // Pass loading state
        pagination={paginationProps} // Pass pagination props object
      />
    </div>
  )
}