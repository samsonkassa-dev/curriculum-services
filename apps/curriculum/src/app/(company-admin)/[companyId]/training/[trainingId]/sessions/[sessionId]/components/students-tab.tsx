"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { useStudents, Student } from "@/lib/hooks/useStudents"
import { Session, useAssignedStudentsForSession } from "@/lib/hooks/useSession" // Keep Session base type if needed

// Import Student Table components (Corrected paths again)
import { studentColumns } from "../../../components/students/student-columns"
import { StudentDataTable } from "../../../components/students/student-data-table"
import { AddStudentModal } from "./add-student-modal" // Import the modal component

interface StudentsTabProps {
  session: Session;
  isLoading: boolean;
  sessionId: string;
  trainingId: string;
  companyId: string;
}

export function StudentsTab({ session, isLoading: isSessionLoading, sessionId, trainingId, companyId }: StudentsTabProps) {
  const { isProjectManager, isTrainingAdmin } = useUserRole()

  // State for Students List Tab (Assigned Students)
  const [studentPage, setStudentPage] = useState(1)
  const [studentPageSize, setStudentPageSize] = useState(10)
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const debouncedStudentSearch = useDebounce(studentSearchQuery, 500)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch students for the session using sessionId parameter
  const { 
    data: studentData, 
    isLoading: isLoadingStudents, 
    error: studentError 
  } = useAssignedStudentsForSession(sessionId, studentPage, studentPageSize);

  // Function to open the modal
  const handleOpenAddStudentModal = () => {
    setIsModalOpen(true);
  }
  
  // Function to close the modal (passed to the modal component)
  const handleCloseAddStudentModal = () => {
    setIsModalOpen(false);
  }

  // Handle page size change for student table
  const handleStudentPageSizeChange = (newPageSize: number) => {
    setStudentPageSize(newPageSize)
    setStudentPage(1) // Reset to first page when changing page size
  }

  // Get assigned students from API data
  const assignedStudents = studentData?.trainees || [];
  
  // Apply client-side search filter if needed
  const filteredAssignedStudents = debouncedStudentSearch 
    ? assignedStudents.filter((student: Student) => 
        student?.firstName?.toLowerCase().includes(debouncedStudentSearch.toLowerCase()) ||
        student?.lastName?.toLowerCase().includes(debouncedStudentSearch.toLowerCase()) ||
        student?.email?.toLowerCase().includes(debouncedStudentSearch.toLowerCase())
      )
    : assignedStudents;

  // Use API pagination info when available
  const totalStudentElements = studentData?.totalElements || filteredAssignedStudents.length;
  const totalStudentPages = studentData?.totalPages || Math.ceil(totalStudentElements / studentPageSize);

  const isLoading = isSessionLoading || isLoadingStudents;

  if (isLoading && !studentData) {
    return <Loading />;
  }

  return (
    <div>
      {!assignedStudents || assignedStudents.length === 0 ? (
        // Empty state when no students are assigned yet
        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border border-[#EAECF0]">
          <h3 className="text-lg font-medium mb-2">No Students Assigned Yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Assign students to this session from the available list.
          </p>
          {(isProjectManager || isTrainingAdmin) && (
            <Button
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 mx-auto"
              onClick={handleOpenAddStudentModal} // Open the modal
            >
              <Plus className="h-4 w-4" />
              <span>Assign Student</span>
            </Button>
          )}
        </div>
      ) : (
        // Table view when students are assigned
        <div>
          <div className="flex items-center justify-between mb-6">
            {/* Search Input */}
            <div className="relative md:w-[300px]">
              <Search className="absolute text-sm left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assigned students..."
                className="pl-10 h-10 text-sm bg-white border-gray-200"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
              />
            </div>
            {/* Assign Student Button */}
            {(isProjectManager || isTrainingAdmin) && (
              <Button 
                className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
                onClick={handleOpenAddStudentModal} // Open the modal
              >
                <Plus className="h-4 w-4" />
                <span>Assign Student</span>
              </Button>
            )}
          </div>

          {/* Student Data Table */}
          <StudentDataTable
            columns={studentColumns}
            data={filteredAssignedStudents}
            isLoading={isLoadingStudents}
            pagination={{
              totalPages: totalStudentPages,
              currentPage: studentPage,
              setPage: setStudentPage,
              pageSize: studentPageSize,
              setPageSize: handleStudentPageSizeChange,
              totalElements: totalStudentElements
            }}
          />
        </div>
      )}

      {/* Render the Modal */}
      {(isProjectManager || isTrainingAdmin) && (
        <AddStudentModal
          isOpen={isModalOpen}
          onClose={handleCloseAddStudentModal}
          sessionId={sessionId}
          trainingId={trainingId}
          companyId={companyId}
          assignedStudentIds={assignedStudents.map(s => s.id)} // Pass IDs of already assigned students
        />
      )}
    </div>
  )
} 