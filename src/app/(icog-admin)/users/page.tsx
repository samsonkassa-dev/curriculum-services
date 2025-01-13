"use client"

import { useState, useEffect } from "react"
import { UserTabs } from "./components/user-tabs"
import { IndividualDataTable, CompanyDataTable } from "./components/data-table"
import { individualColumns, companyColumns } from "./components/columns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { useCompanyProfiles } from "@/lib/hooks/useFetchCompanyProfiles"
import { useCompanyAdmins } from "@/lib/hooks/useCompanyAdmins"
import { useDebounce } from "@/lib/hooks/useDebounce"

export default function Users() {
  const [activeTab, setActiveTab] = useState<'individual' | 'company'>('company')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const { data: companyData, isLoading: isCompanyLoading } = useCompanyProfiles({ 
    page, 
    pageSize, 
    searchQuery: debouncedSearch 
  })
  const { data: adminData, isLoading: isAdminLoading } = useCompanyAdmins()

  // Use API's pagination values instead of client-side filtering
  const paginatedCompanyData = companyData?.companyProfiles || []
  const totalElements = companyData?.totalElements || 0
  const totalPages = companyData?.totalPages || 0

  // Calculate showing ranges using API values
  const companyStartRecord = paginatedCompanyData.length ? ((page - 1) * pageSize) + 1 : 0
  const companyEndRecord = Math.min(page * pageSize, totalElements)

  // Reset page when switching tabs or changing pageSize
  useEffect(() => {
    setPage(1)
  }, [activeTab, pageSize])

  // Individual data pagination (unchanged)
  const filteredIndividualData = adminData?.companyAdmins.filter(admin => 
    admin.firstName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    admin.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || []

  const individualStartIndex = (page - 1) * pageSize
  const individualEndIndex = individualStartIndex + pageSize
  const paginatedIndividualData = filteredIndividualData
    .slice(individualStartIndex, individualEndIndex)
    .map(admin => ({
      id: admin.id,
      fullName: `${admin.firstName} ${admin.lastName}`,
      email: admin.email,
      status: admin.emailVerified ? "Active" as const : "Deactivated" as const,
      createdAt: "N/A"
    }))

  // Calculate showing ranges
  const individualStartRecord = filteredIndividualData.length ? individualStartIndex + 1 : 0
  const individualEndRecord = Math.min(individualEndIndex, filteredIndividualData.length)
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
  }

  return (
    <div className="flex min-h-screen md:w-[calc(100%-85px)] md:pl-[85px] md:mx-auto w-full">
      <div className="flex-1 p-4 md:p-8 min-w-0">
        <h1 className="text-lg font-semibold mb-6">
          {activeTab === 'individual' ? 'Individual' : 'Company'}
        </h1>
        
        <UserTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
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
            variant="outline" 
            size="default"
            className="h-10 px-4 border-gray-200 rounded-lg font-medium"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {activeTab === 'individual' ? (
          <IndividualDataTable
            columns={individualColumns}
            data={paginatedIndividualData}
            isLoading={isAdminLoading}
            pagination={{
              pageCount: Math.ceil(filteredIndividualData.length / pageSize),
              page,
              setPage: handlePageChange,
              pageSize,
              setPageSize: handlePageSizeChange,
              showingText: `Showing ${individualStartRecord} to ${individualEndRecord} out of ${filteredIndividualData.length} records`
            }}
          />
        ) : (
          <CompanyDataTable
            columns={companyColumns}
            data={paginatedCompanyData}
            isLoading={isCompanyLoading}
            pagination={{
              pageCount: totalPages,
              page,
              setPage: handlePageChange,
              pageSize,
              setPageSize: handlePageSizeChange,
              showingText: totalElements > 0 
                ? `Showing ${companyStartRecord} to ${companyEndRecord} out of ${totalElements} records`
                : "No records to show"
            }}
          />
        )}
      </div>
    </div>
  )
}
