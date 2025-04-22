"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useJobs } from "@/lib/hooks/useJobs"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { createJobColumns } from "./job-columns"
import { JobDataTable } from "./job-data-table"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { CreateJobModal } from "./create-job-modal"
import { JobDetailModal } from "./job-detail-modal"

export function JobsList() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string>("")

  const { isProjectManager, isTrainingAdmin } = useUserRole()
  
  const { data, isLoading, error } = useJobs({
    page: page,
    pageSize: pageSize,
  })

  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId)
    setIsDetailModalOpen(true)
  }

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
  }

  const filteredJobs = (data?.jobs || []).filter(job => 
    job?.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    job?.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) 
  )

  const totalElements = filteredJobs.length
  const totalPages = Math.ceil(totalElements / pageSize)

  const paginatedJobs = filteredJobs.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  // Create columns with the handler
  const jobColumns = createJobColumns(handleViewDetails)

  if (isLoading && !data) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="px-[7%] py-10 text-center text-red-600">
        <p>Error loading jobs: {error.message}</p>
      </div>
    )
  }

  const noJobsAvailable = filteredJobs.length === 0;

  if (noJobsAvailable && !debouncedSearch && !isLoading) {
    return (
      <div className="px-[7%] py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold">Jobs</h1>
          {(isProjectManager || isTrainingAdmin) && (
            <Button 
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
              onClick={handleOpenCreateModal}
            >
              <Plus className="h-4 w-4" />
              <span>Create Job</span>
            </Button>
          )}
        </div>

        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Jobs Created Yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Create job posts to find and assign trainers to training sessions.
          </p>
          {(isProjectManager || isTrainingAdmin) && (
            <Button
              className="mt-4 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
              onClick={handleOpenCreateModal}
            >
              Create Job
            </Button>
          )}
        </div>
        {(isProjectManager || isTrainingAdmin) && (
          <CreateJobModal 
            isOpen={isCreateModalOpen} 
            onClose={handleCloseCreateModal} 
          />
        )}
      </div>
    )
  }

  return (
    <div className="px-[8%] md:pr-14 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Jobs</h1>
        {(isProjectManager || isTrainingAdmin) && (
          <Button 
            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
            onClick={handleOpenCreateModal}
          >
            <Plus className="h-4 w-4" />
            <span>Create Job</span>
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative md:w-[300px]">
          <Search className="absolute text-sm left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs by title..."
            className="pl-10 h-10 text-sm bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

       {noJobsAvailable && debouncedSearch && !isLoading && (
         <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
           <h3 className="text-lg font-medium mb-2">No Jobs Found</h3>
           <p className="text-gray-500 text-sm">
             Your search for &quot;{debouncedSearch}&quot; did not match any jobs.
           </p>
         </div>
       )}

      {!noJobsAvailable && (
        <JobDataTable
          columns={jobColumns}
          data={paginatedJobs}
          isLoading={isLoading}
          pagination={{
            totalPages,
            currentPage: page,
            setPage,
            pageSize,
            setPageSize: handlePageSizeChange,
            totalElements 
          }}
        />
      )}

      {(isProjectManager || isTrainingAdmin) && (
        <CreateJobModal 
          isOpen={isCreateModalOpen} 
          onClose={handleCloseCreateModal} 
        />
      )}

      {/* Job Detail Modal */}
      {selectedJobId && (
        <JobDetailModal
          jobId={selectedJobId}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  )
} 