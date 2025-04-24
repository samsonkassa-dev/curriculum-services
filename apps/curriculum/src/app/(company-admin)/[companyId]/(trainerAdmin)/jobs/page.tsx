"use client"

import { use } from 'react'
import { useState } from "react"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Filter } from "@/components/ui/filter"
import { useApplications } from "@/lib/hooks/useApplication"
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
  const [status, setStatus] = useState<string>()
 
  // Fetch jobs with server-side pagination
  const { data, isLoading } = useApplications(page, pageSize)

  const statusOptions = [
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'PENDING', label: 'Pending' },
  ]

  const handleFilterApply = ({
    selectedStatus,
  }: {
    selectedStatus?: string;
  }) => {
    setStatus(selectedStatus)
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
          <div className="relative md:w-[300px]">
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
          </div>
          <Filter
            statusOptions={statusOptions}
            onApply={handleFilterApply}
            defaultSelected={{
              status,
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
  