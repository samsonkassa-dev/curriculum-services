"use client"

import { useState } from "react"
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

  // Filter and paginate company data on client side
  const filteredCompanyData = companyData?.companyProfiles?.filter(company => 
    company.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    company.businessType.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || []

  // Calculate pagination for company data
  const companyStartIndex = (page - 1) * pageSize
  const companyEndIndex = companyStartIndex + pageSize
  const paginatedCompanyData = filteredCompanyData.slice(companyStartIndex, companyEndIndex)

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
  
  const companyStartRecord = filteredCompanyData.length ? companyStartIndex + 1 : 0
  const companyEndRecord = Math.min(companyEndIndex, filteredCompanyData.length)

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
              pageCount: Math.ceil(filteredCompanyData.length / pageSize),
              page,
              setPage: handlePageChange,
              pageSize,
              setPageSize: handlePageSizeChange,
              showingText: `Showing ${companyStartRecord} to ${companyEndRecord} out of ${filteredCompanyData.length} records`
            }}
          />
        )}
      </div>
    </div>
  )
}
