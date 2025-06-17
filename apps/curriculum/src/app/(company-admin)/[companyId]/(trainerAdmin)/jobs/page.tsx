"use client"

import { use } from 'react'
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Filter } from "@/components/ui/filter"
import { useApplications, ApplicationsFilters } from "@/lib/hooks/useApplication"
import { useJobs } from "@/lib/hooks/useJobs"
import { jobColumns } from "./components/job-columns"
import { JobDataTable } from "./components/job-data-table"

export default function TrainersJobApprovalPage({
  params
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = use(params)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearch !== searchQuery) return // Only when debounced value changes
    setPage(1)
  }, [debouncedSearch, searchQuery])
  const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "REJECTED" | undefined>()
  const [applicationType, setApplicationType] = useState<"MAIN" | "ASSISTANT" | undefined>()
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
 
  // Build filters object
  const filters: ApplicationsFilters = {
    page,
    pageSize,
    ...(status && { applicationStatus: status }),
    ...(applicationType && { applicationType }),
    ...(selectedJobs.length > 0 && { jobIds: selectedJobs }),
    ...(debouncedSearch && { search: debouncedSearch }),
  }

  // Fetch applications with server-side pagination and filters
  const { data, isLoading } = useApplications(filters)

  // Fetch jobs for the filter dropdown with a reasonable limit
  const { data: jobsData } = useJobs({ 
    page: 1, 
    pageSize: 100, // Fetch first 100 jobs - adjust based on your needs
    status: "ACTIVE" // Only fetch active jobs for filtering
  })

  const statusOptions = [
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'PENDING', label: 'Pending' },
  ]

  const applicationTypeOptions = [
    { id: 'MAIN', label: 'Main' },
    { id: 'ASSISTANT', label: 'Assistant' },
  ]

  // Transform jobs data for the filter component
  const jobOptions = jobsData?.jobs?.map(job => ({
    id: job.id,
    label: job.title
  })) || []

  const handleFilterApply = ({
    selectedStatus,
    selectedApplicationType,
    selectedJobs,
  }: {
    selectedStatus?: string;
    selectedApplicationType?: string;
    selectedJobs?: string[];
  }) => {
    setStatus(selectedStatus as "PENDING" | "ACCEPTED" | "REJECTED" | undefined)
    setApplicationType(selectedApplicationType as "MAIN" | "ASSISTANT" | undefined)
    setSelectedJobs(selectedJobs || [])
    setPage(1)
  }

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }

  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <h1 className="text-lg font-normal mb-6">Jobs</h1>

        <div className="flex items-center lg:justify-end gap-3 mb-6">
          {/* <div className="relative md:w-[300px]">
            <Image
              src="/search.svg"
              alt="Search"
              width={19}
              height={19}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5 z-10"
            />
            <Input
              placeholder="Search jobs..."
              className="pl-10 h-10 bg-white border-gray-200 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}
          <Filter
            statusOptions={statusOptions}
            applicationTypeOptions={applicationTypeOptions}
            jobOptions={jobOptions}
            onApply={handleFilterApply}
            defaultSelected={{
              status,
              applicationType,
              jobs: selectedJobs,
            }}
          />
        </div>

        <JobDataTable
          columns={jobColumns}
          data={data?.applications || []}
          isLoading={isLoading}
          pagination={{
            totalPages: data?.totalPages || 1,
            currentPage: page,
            setPage,
            pageSize,
            setPageSize: handlePageSizeChange,
            totalElements: data?.totalElements || 0,
          }}
        />
      </div>
    </div>
  );
}
  