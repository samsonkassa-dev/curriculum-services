"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Check, X, MessageSquare, X as CloseIcon, CheckCircle, AlertCircle } from "lucide-react"
import { formatDateToDisplay } from "@/lib/utils"
import { useState } from "react"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import PreAssessmentModal from "./pre-assessment/pre-assessmnet-modal"

// Define the student type for attendance
export interface AttendanceStudent {
  id: string
  firstName: string
  lastName: string
  email: string
  attendance?: 'present' | 'absent'
  comment?: string
  attendanceId?: string
  sessionDate: string
  _onAttendanceChange?: (id: string, status: 'present' | 'absent') => void
  _onCommentChange?: (id: string, comment: string) => void
  _isProcessing?: boolean
  _isDisabled?: boolean // Added to indicate if controls should be disabled
  [key: string]: string | 'present' | 'absent' | undefined | ((id: string, value: string) => void) | ((id: string, status: 'present' | 'absent') => void) | boolean
}

// CommentDialog component
function CommentDialog({ 
  student, 
  comment, 
  onCommentChange,
  disabled = false
}: { 
  student: AttendanceStudent,
  comment?: string,
  onCommentChange: (comment: string) => void,
  disabled?: boolean
}) {
  const [localComment, setLocalComment] = useState(comment || "")
  const [isOpen, setIsOpen] = useState(false)
  
  const handleSave = () => {
    onCommentChange(localComment)
    setIsOpen(false)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className={`w-6 h-6 rounded-full flex items-center justify-center ml-2 ${
            comment ? 'text-[#0B75FF] bg-[#5da8f3]' : 'text-gray-400 bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
          aria-label={`Add comment for ${student.firstName} ${student.lastName}`}
          disabled={disabled}
        >
          <MessageSquare size={12} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Attendance Comment</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
            placeholder="Add a comment about this student's attendance..."
            className="min-h-[120px]"
          />
        </div>
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#0B75FF] hover:bg-blue-700 text-white"
          >
            Save Comment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const createAttendanceColumns = (sessionId: string) => {
  const columns: ColumnDef<AttendanceStudent>[] = [
    {
      accessorKey: "name",
      header: "Full Name",
      cell: ({ row }) => {
        const student = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(11,117,255,0.6)] flex items-center justify-center text-white">
              {student.firstName?.[0]}{student.lastName?.[0]}
            </div>
            <span className="text-sm">{student.firstName} {student.lastName}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <span className="text-sm text-[#667085]">{row.original.email}</span>
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        return (
          <span className="text-sm text-[#667085]">
            {formatDateToDisplay(row.original.sessionDate || '')}
          </span>
        )
      },
    },
    {
      accessorKey: "attendance",
      header: "Attendance",
      cell: ({ row }) => {
        const student = row.original
        const hasAttendance = student.attendance !== undefined
        const isProcessing = student._isProcessing === true
        const isDisabled = student._isDisabled === true || isProcessing; // Check if controls should be disabled
        
        // Visual enhancement - container for attendance buttons
        const attendanceContainerClass = hasAttendance 
          ? "p-1 rounded-md bg-opacity-20 border border-gray-200" 
          : ""
        
        return (
          <div className={`flex gap-2 items-center ${attendanceContainerClass} ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <button 
              className={`w-6 h-6 rounded-full ${
                student.attendance === 'present' 
                  ? 'bg-[#ECFDF3] ring-2 ring-[#037847] shadow-sm' 
                  : 'bg-[#F2F4F7]'
              } flex items-center justify-center transition-all ${isDisabled ? 'pointer-events-none' : ''}`} // Disable pointer events if needed
              aria-label={`Mark ${student.firstName} ${student.lastName} as present`}
              onClick={() => {
                if (row.original._onAttendanceChange) {
                  row.original._onAttendanceChange(student.id, 'present')
                }
              }}
              disabled={isDisabled} // Disable button if needed
            >
              <Check size={12} className={`${student.attendance === 'present' ? 'text-[#037847] font-bold' : 'text-gray-400'}`} />
            </button>
            <button 
              className={`w-6 h-6 rounded-full ${
                student.attendance === 'absent' 
                  ? 'bg-[rgba(243,88,88,0.47)] ring-2 ring-[#D03710] shadow-sm' 
                  : 'bg-[#F2F4F7]'
              } flex items-center justify-center transition-all ${isDisabled ? 'pointer-events-none' : ''}`} // Disable pointer events if needed
              aria-label={`Mark ${student.firstName} ${student.lastName} as absent`}
              onClick={() => {
                if (row.original._onAttendanceChange) {
                  row.original._onAttendanceChange(student.id, 'absent')
                }
              }}
              disabled={isDisabled} // Disable button if needed
            >
              <X size={12} className={`${student.attendance === 'absent' ? 'text-[#D03710] font-bold' : 'text-gray-400'}`} />
            </button>
            
            {/* Status indicator */}
            {hasAttendance && (
              <div className="ml-1 text-xs font-medium">
                {student.attendance === 'present' ? (
                  <span className="text-green-700">Present</span>
                ) : (
                  <span className="text-red-700">Absent</span>
                )}
              </div>
            )}
            
            {/* Comment button with dialog */}
            {row.original._onCommentChange && (
              <CommentDialog 
                student={student} 
                comment={student.comment}
                onCommentChange={(comment) => {
                  row.original._onCommentChange?.(student.id, comment)
                }}
                disabled={isDisabled} // Disable comment dialog trigger if needed
              />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "assessment",
      header: "Assessment",
      cell: ({ row }) => {
        const student = row.original;
        const fullName = `${student.firstName} ${student.lastName}`;
        
        // We now get the sessionId from the column factory function
        if (!sessionId) {
          return (
            <span className="text-xs text-gray-400">Session not available</span>
          );
        }
        
        return (
          <PreAssessmentModal 
            sessionId={sessionId}
            studentId={student.id}
            studentName={fullName}
            trigger={
              <Button 
                variant="outline" 
                className="text-blue-600 border-blue-600 text-xs h-7 px-2 hover:bg-blue-50"
              >
                Add Pre Assessment
              </Button>
            }
          />
        );
      },
    },
  ];
  
  return columns;
};

// Export a static version for compatibility with existing code
export const attendanceColumns = createAttendanceColumns(""); 