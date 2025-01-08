"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { IndividualDataTable } from "./components/data-table"
import { individualColumns } from "./components/columns"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { IndividualUser } from "@/types/users"

// Temporary mock data
const mockIndividuals: IndividualUser[] = [
  {
    id: "1",
    fullName: "Jane Cooper",
    email: "jessica.hanson@example.com",
    status: "Active" as const,
    createdAt: "5/27/15"
  }
]

export default function CompanyAdminUsers() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(7)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Calculate showing range
  const startRecord = ((page - 1) * pageSize) + 1
  const endRecord = Math.min(page * pageSize, mockIndividuals.length)
  const totalRecords = mockIndividuals.length

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }

  return (
    <div className="flex min-h-screen md:w-[calc(100%-85px)] md:pl-[85px] md:mx-auto w-full">
        <div className="flex-1 p-4 md:p-8 min-w-0">
        <h1 className="text-lg font-semibold mb-6">Users</h1>
        
      
        <div className="flex items-center lg:justify-end gap-3 mb-6">
          <div className="relative md:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search"
              className="pl-10 h-10 bg-white border-gray-200 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
       
            className=" text-brand border-[0.3px] border-brand"
            variant="outline"
          >
            Invite Curriculum Admin
          </Button>
        </div>

        <IndividualDataTable
          columns={individualColumns}
          data={mockIndividuals}
          isLoading={false}
          pagination={{
            pageCount: Math.ceil(mockIndividuals.length / pageSize),
            page,
            setPage,
            pageSize,
            setPageSize: handlePageSizeChange,
            showingText: `Showing ${startRecord} to ${endRecord} out of ${totalRecords} records`
          }}
        />
      </div>
    </div>
  )
}