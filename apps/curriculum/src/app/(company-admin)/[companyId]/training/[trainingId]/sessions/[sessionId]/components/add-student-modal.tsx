"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Search, Loader2 } from 'lucide-react'; // Import Loader2 instead
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input
import { useStudents } from '@/lib/hooks/useStudents'; // Import useStudents hook and type
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Loading } from '@/components/ui/loading';
import { StudentDataTable } from '../../../components/students/student-data-table'; // Correct path to student table
import { modalStudentColumns } from './modal-student-columns'; // Import modal columns
import { RowSelectionState } from '@tanstack/react-table';
import { useAddTraineesToSession } from '@/lib/hooks/useSession'; // Import our new hook
import { toast } from 'sonner';

// TODO: Import your API call function for assigning students
// import { assignStudentsToSession } from '@/lib/api/sessions'; 

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  trainingId: string;
  companyId: string;
  assignedStudentIds: string[];
}

export function AddStudentModal({ 
  isOpen,
  onClose,
  sessionId,
  trainingId,
  companyId,
  assignedStudentIds 
}: AddStudentModalProps) {

  const [modalPage, setModalPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(10); // Or match Figma default (7?)
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const debouncedModalSearch = useDebounce(modalSearchQuery, 500);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  
  // Get mutation hook for adding trainees
  const { addTrainees, isLoading: isAssigning } = useAddTraineesToSession();

  // Fetch students for the training - Adjust hook call signature
  const { 
    data: studentData, 
    isLoading: isLoadingStudents, 
    error: studentError 
  } = useStudents(trainingId, modalPage, modalPageSize); // Corrected arguments

  // Filter out already assigned students AND apply search client-side
  const availableStudents = useMemo(() => {
    const allFetchedStudents = studentData?.trainees || [];
    const unassigned = allFetchedStudents.filter(student => !assignedStudentIds.includes(student.id));
    if (!debouncedModalSearch) {
      return unassigned; // No search query
    }
    // Apply search filter
    return unassigned.filter(student => 
      student?.firstName?.toLowerCase().includes(debouncedModalSearch.toLowerCase()) ||
      student?.lastName?.toLowerCase().includes(debouncedModalSearch.toLowerCase()) ||
      student?.email?.toLowerCase().includes(debouncedModalSearch.toLowerCase())
    );
  }, [studentData, assignedStudentIds, debouncedModalSearch]); // Add search dependency

  // --- Pagination and Selection Logic --- 
  // Note: Pagination might be slightly off if totalElements from hook doesn't account for client-side filtering
  const totalAvailableElements = availableStudents.length; // Use length after client-side filtering
  const totalStudentElements = studentData?.totalElements || totalAvailableElements; // Use total from hook preferentially if available
  const totalStudentPages = Math.ceil(totalStudentElements / modalPageSize); // Base pagination on hook's total if possible

  const selectedStudentIds = useMemo(() => {
      // Important: This assumes availableStudents indices align with rowSelection keys after filtering.
      // If pagination/filtering becomes complex, getting selected rows directly from table instance is safer.
      return Object.keys(rowSelection)
          .filter(index => rowSelection[index])
          .map(index => availableStudents[parseInt(index, 10)]?.id)
          .filter((id): id is string => !!id); // Type guard for filtering out undefined
  }, [rowSelection, availableStudents]);

  const handleModalPageSizeChange = (newPageSize: number) => {
      setModalPageSize(newPageSize);
      setModalPage(1); // Reset page
  };

  // Function to handle assigning selected students
  const handleAssignStudents = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error("No students selected");
      return;
    }
    
    try {
      // Call the API to add trainees to the session
      addTrainees({
        sessionId,
        traineeIds: selectedStudentIds,
        trainingId // Pass the trainingId to ensure training-level student queries are invalidated
      }, {
        onSuccess: () => {
          setRowSelection({}); // Clear selection
          onClose(); // Close modal on success
        }
      });
    } catch (err) {
      console.error("Failed to assign students:", err);
    }
  };

  // Effect to clear selection when modal reopens or available students change
  useEffect(() => {
      setRowSelection({});
  }, [isOpen, availableStudents])

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 flex flex-col max-h-[80vh]"> {/* Removed padding, added flex-col and max-height */}
        {/* Header Section (Fixed) */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0"> {/* Added flex-shrink-0 */}
           <DialogHeader className="mb-4"> {/* Add margin bottom to header */}
             <DialogTitle className="text-lg font-semibold text-[#1B2128]">Add Students</DialogTitle>
           </DialogHeader>
           {/* Search, Filter, and Add Button Row */} 
           <div className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-4 flex-grow"> {/* Group search and filter */}
               <div className="relative md:w-[300px]">
                 <Search className="absolute text-sm left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                 <Input
                     placeholder="Search students..."
                     className="pl-10 h-10 text-sm bg-white border-gray-300 rounded-lg"
                     value={modalSearchQuery}
                     onChange={(e) => setModalSearchQuery(e.target.value)}
                 />
               </div>
               <Button variant="outline" className="flex items-center gap-2 border-gray-300 text-[#344054] h-10 whitespace-nowrap"> {/* Added h-10 */}
                 <Filter className="h-4 w-4" />
                 <span>Filters</span>
               </Button>
             </div>
             {/* Moved Add Button Here */}
             <Button 
               type="button" 
               onClick={handleAssignStudents} 
               disabled={selectedStudentIds.length === 0 || isAssigning} 
               className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 h-10 flex-shrink-0"
             >
               {isAssigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
               Add {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} ` : ''}Student{selectedStudentIds.length === 1 ? '' : 's'}
             </Button>
           </div>
        </div>

        {/* Content Section - Table (Scrollable) */}
        <div className='p-6 space-y-4 overflow-y-auto flex-grow'> {/* Added overflow-y-auto and flex-grow */}
          {/* Student Table */}
          {isLoadingStudents ? (
              <div className="flex justify-center items-center h-60">
                  <Loading />
              </div>
          ) : studentError ? (
              <div className="text-center text-red-600 py-10">Error loading students.</div>
          ) : (
              <StudentDataTable
                  columns={modalStudentColumns}
                  data={availableStudents} // Pass filtered available students
                  isLoading={isLoadingStudents}
                  pagination={{
                      totalPages: totalStudentPages,
                      currentPage: modalPage,
                      setPage: setModalPage,
                      pageSize: modalPageSize,
                      setPageSize: handleModalPageSizeChange,
                      totalElements: totalStudentElements, // Use potentially filtered total
                  }}
                  rowSelection={rowSelection}
                  onRowSelectionChange={setRowSelection}
              />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 