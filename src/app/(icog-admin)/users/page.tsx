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
  const [pageSize, setPageSize] = useState(7)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const { 
    data: companyData, 
    isLoading: isCompanyLoading 
  } = useCompanyProfiles({ 
    page,
    pageSize,
    searchQuery: debouncedSearch 
  })

  const { data: adminData, isLoading: isAdminLoading } = useCompanyAdmins()

  // Transform admin data to match table structure
  const individualData = adminData?.companyAdmins.map(admin => ({
    id: admin.id,
    fullName: `${admin.firstName} ${admin.lastName}`,
    email: admin.email,
    status: admin.emailVerified ? "Active" as const : "Deactivated" as const,
    createdAt: "N/A"
  })) || []

  // Calculate showing range
  const startRecord = ((page - 1) * pageSize) + 1
  const endRecord = Math.min(page * pageSize, companyData?.totalElements ?? 0)
  const totalRecords = companyData?.totalElements ?? 0

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
  }

  return (
    <div className="flex min-h-screen w-[calc(100%-85px)] pl-[85px] mx-auto">
      <div className="flex-1 p-8">
        <h1 className="text-lg font-semibold mb-6">
          {activeTab === 'individual' ? 'Individual' : 'Company'}
        </h1>
        
        <UserTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex items-center justify-end gap-3 mb-6">
          <div className="relative w-[300px]">
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
            data={individualData}
            isLoading={isAdminLoading}
            pagination={{
              pageCount: Math.ceil(individualData.length / pageSize),
              page,
              setPage,
              pageSize,
              setPageSize: handlePageSizeChange,
              showingText: `Showing ${startRecord} to ${endRecord} out of ${individualData.length} records`
            }}
          />
        ) : (
          <CompanyDataTable
            columns={companyColumns}
            data={companyData?.companyProfiles ?? []}
            isLoading={isCompanyLoading}
            pagination={{
              pageCount: companyData?.totalPages ?? 0,
              page,
              setPage,
              pageSize,
              setPageSize: handlePageSizeChange,
              showingText: `Showing ${startRecord} to ${endRecord} out of ${totalRecords} records`
            }}
          />
        )}
      </div>
    </div>
  )
}
