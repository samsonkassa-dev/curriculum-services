"use client"

import { use } from 'react'
import { useState } from "react"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { useDebounce } from "@/lib/hooks/useDebounce"
import { useCompanyUsers } from "@/lib/hooks/useFetchTrainingUsers"
import { companyColumns } from "./components/company-columns"
import { CompanyUsersDataTable } from "./components/company-data-table"
import { Filter } from "@/components/ui/filter";

export default function CompanyAdminUsers({
  params
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = use(params)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [role, setRole] = useState<string>();
 
  // Fetch company users with server-side pagination
  const { data, isLoading } = useCompanyUsers({
    page,
    pageSize,
    searchQuery: debouncedSearch,
    companyId,
    role
  })

  const roleOptions = [
    { id: 'ROLE_COMPANY_ADMIN', label: 'Company Admin' },
    { id: 'ROLE_CURRICULUM_ADMIN', label: 'Curriculum Admin' },
    { id: 'ROLE_CONTENT_DEVELOPER', label: 'Content Developer' },
    {id: 'ROLE_PROJECT_MANAGER', label: 'Project Manager'}
  ];

  const handleFilterApply = ({
    selectedStatus,
  }: {
    selectedStatus?: string;
  }) => {
    setRole(selectedStatus);
    setPage(1);
  };




  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }

  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <h1 className="text-lg font-normal mb-6">Users</h1>

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
              placeholder="Search users..."
              className="pl-10 h-10 bg-white border-gray-200 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Filter
              statusOptions={roleOptions}
              onApply={handleFilterApply}
              defaultSelected={{
                status: role,
              }}
            />


        </div>

        <CompanyUsersDataTable
          columns={companyColumns}
          data={data?.users || []}
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