"use client"

import { useState } from "react"
import { UserTabs } from "./components/user-tabs"
import { IndividualDataTable, CompanyDataTable } from "./components/data-table"
import { individualColumns, companyColumns } from "./components/columns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { IndividualUser, CompanyUser } from "@/types/users"


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

const mockCompanies: CompanyUser[] = [
  {
    id: "1",
    companyName: "Name of the Company",
    businessType: "Private" as const,
    email: "jessica.hanson@example.com",
    status: "Approved" as const,
    createdAt: "5/27/15"
  },
  {
    id: "2",
    companyName: "Name of the Company",
    businessType: "Public" as const,
    email: "jessica.hanson@example.com",
    status: "Declined" as const,
    createdAt: "5/27/15"
  },
  {
    id: "3",
    companyName: "Name of the Company",
    businessType: "Private" as const,
    email: "jessica.hanson@example.com",
    status: "Pending" as const,
    createdAt: "5/27/15"
  },
  {
    id: "4",
    companyName: "Name of the Company",
    businessType: "Private" as const,
    email: "jessica.hanson@example.com",
    status: "Pending" as const,
    createdAt: "5/27/15"
  }
]

export default function Users() {
  const [activeTab, setActiveTab] = useState<'individual' | 'company'>('company')
  const [isLoading] = useState(false)

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
            data={mockIndividuals}
            isLoading={isLoading}
          />
        ) : (
          <CompanyDataTable
            columns={companyColumns}
            data={mockCompanies}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
