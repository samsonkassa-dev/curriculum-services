"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { useStudents } from "@/lib/hooks/useStudents"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { studentColumns } from "./students/student-columns"
import { StudentDataTable } from "./students/student-data-table"

interface StudentsComponentProps {
  trainingId: string
}

export function StudentsComponent({ trainingId }: StudentsComponentProps) {
  const router = useRouter()
  const params = useParams()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  const { isProjectManager, isTrainingAdmin } = useUserRole()
  const { data, isLoading } = useStudents(trainingId, page, pageSize)

  const handleAddStudent = () => {
    router.push(`/${params.companyId}/training/${trainingId}/students/add`)
  }
  
  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }

  if (isLoading) {
    return <Loading />
  }

  if (!data?.trainees?.length) {
    return (
      <div className="px-[7%] py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold">Students</h1>
          {(isProjectManager || isTrainingAdmin) && (
            <Button 
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
              onClick={handleAddStudent}
            >
              <Plus className="h-4 w-4" />
              <span>Add Student</span>
            </Button>
          )}
        </div>

        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Student Added Yet</h3>
          <p className="text-gray-500 text-sm">
            This specifies the core teaching methods used to deliver content and facilitate learning.
          </p>
          {(isProjectManager || isTrainingAdmin) && (
            <Button
              className="mt-4 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
              onClick={handleAddStudent}
            >
              Add Student
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Client-side filtering for search (in a production app, this would be done server-side)
  const filteredStudents = data?.trainees.filter(student => 
    student?.firstName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    student?.lastName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    student?.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || []

  const totalElements = filteredStudents.length
  const totalPages = Math.ceil(totalElements / pageSize)

  // Paginate the filtered students
  const paginatedStudents = filteredStudents.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  return (
    <div className="px-[7%] py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Students</h1>
        {(isProjectManager || isTrainingAdmin) && (
          <Button 
            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
            onClick={handleAddStudent}
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative md:w-[300px]">
          <Search className="absolute text-sm left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search students..."
            className="pl-10 h-10 text-sm bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <StudentDataTable
        columns={studentColumns}
        data={paginatedStudents}
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
    </div>
  )
} 