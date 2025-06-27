"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Check, X, MessageSquare, X as CloseIcon, CheckCircle, AlertCircle, Edit2, Save, XCircle } from "lucide-react"
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
import AssessmentModal from "./assessment-modal"
import { Session } from "@/lib/hooks/useSession"
import { SurveyButton } from "./survey-button"

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
  answerFileLink?: string | null
  _onAttendanceChange?: (id: string, status: 'present' | 'absent') => void
  _onCommentChange?: (id: string, comment: string) => void
  _isProcessing?: boolean
  _isSelected?: boolean // Track if student is selected for bulk operations
  _onSelectionChange?: (id: string, selected: boolean) => void
  _isEditing?: boolean // Track if this student is in edit mode
  _onEditModeChange?: (id: string, editing: boolean) => void
  _hasUnsavedChanges?: boolean // Track if this student has unsaved changes
  [key: string]: string | 'present' | 'absent' | null | undefined | ((id: string, value: string) => void) | ((id: string, status: 'present' | 'absent') => void) | ((id: string, selected: boolean) => void) | ((id: string, editing: boolean) => void) | boolean
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
            comment 
              ? student.attendance === 'present' 
                ? 'text-[#037847] bg-[#ECFDF3] ring-1 ring-[#037847]' 
                : student.attendance === 'absent'
                ? 'text-[#D03710] bg-[rgba(243,88,88,0.47)] ring-1 ring-[#D03710]'
                : 'text-[#0B75FF] bg-blue-50 ring-1 ring-[#0B75FF]'
              : 'text-gray-400 bg-gray-100'
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

export const createAttendanceColumns = (
  sessionId: string,
  canEditAssessment: boolean = false,
  session?: Session,
  trainingId?: string,
  extras: ColumnDef<AttendanceStudent>[] = [],
  hasUnsavedChanges: boolean = false,
  submittedAttendanceIds: Set<string> = new Set(),
  onSaveIndividualAttendance?: (studentId: string) => void
) => {
  const columns: ColumnDef<AttendanceStudent>[] = [
    {
      id: "select",
      header: ({ table }) => {
        // Check if any students have submitted attendance to disable select all
        const hasAnySubmittedAttendance = table.getRowModel().rows.some(row => 
          submittedAttendanceIds.has((row.original as AttendanceStudent).id)
        );
        
        return (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={hasUnsavedChanges || hasAnySubmittedAttendance}
            aria-label="Select all students"
          />
        );
      },
      cell: ({ row }) => {
        const student = row.original
        const hasSubmittedAttendance = submittedAttendanceIds.has(student.id)
        const isSelectionDisabled = hasUnsavedChanges || hasSubmittedAttendance
        
        return (
          <input
            type="checkbox"
            checked={student._isSelected || false}
            onChange={(e) => {
              if (!hasSubmittedAttendance && student._onSelectionChange) {
                student._onSelectionChange(student.id, e.target.checked)
              }
            }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isSelectionDisabled}
            aria-label={`Select ${student.firstName} ${student.lastName}`}
          />
        )
      },
    },
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
        const hasSubmittedAttendance = submittedAttendanceIds.has(student.id)
        const isEditing = student._isEditing === true
        const isDisabled = isProcessing || (hasSubmittedAttendance && !isEditing)
        
        // Visual enhancement - container for attendance buttons
        const attendanceContainerClass = hasAttendance 
          ? "rounded-md bg-opacity-20 border border-gray-200" 
          : ""
        
        return (
          <div className={`flex gap-2 items-center w-80 px-4 py-2 ${attendanceContainerClass} ${hasSubmittedAttendance && !isEditing ? 'opacity-75' : ''} ${isEditing ? 'ring-2 ring-blue-300 bg-blue-50 rounded-lg' : ''}`}>
            <button 
              className={`w-7 h-7 rounded-full ${
                student.attendance === 'present' 
                  ? 'bg-[#ECFDF3] ring-2 ring-[#037847] shadow-sm' 
                  : 'bg-[#F2F4F7]'
              } flex items-center justify-center transition-all flex-shrink-0 ${isDisabled ? 'cursor-not-allowed' : ''}`}
              aria-label={`Mark ${student.firstName} ${student.lastName} as present`}
              onClick={() => {
                if (!isDisabled && row.original._onAttendanceChange) {
                  row.original._onAttendanceChange(student.id, 'present')
                }
              }}
              disabled={isDisabled}
            >
              <Check size={14} className={`${student.attendance === 'present' ? 'text-[#037847] font-bold' : 'text-gray-400'}`} />
            </button>
            <button 
              className={`w-7 h-7 rounded-full ${
                student.attendance === 'absent' 
                  ? 'bg-[rgba(243,88,88,0.47)] ring-2 ring-[#D03710] shadow-sm' 
                  : 'bg-[#F2F4F7]'
              } flex items-center justify-center transition-all flex-shrink-0 ${isDisabled ? 'cursor-not-allowed' : ''}`}
              aria-label={`Mark ${student.firstName} ${student.lastName} as absent`}
              onClick={() => {
                if (!isDisabled && row.original._onAttendanceChange) {
                  row.original._onAttendanceChange(student.id, 'absent')
                }
              }}
              disabled={isDisabled}
            >
              <X size={14} className={`${student.attendance === 'absent' ? 'text-[#D03710] font-bold' : 'text-gray-400'}`} />
            </button>
            
            {/* Status indicator */}
            {hasAttendance && (
              <div className="ml-1 text-xs font-medium flex items-center gap-1.5">
                {student.attendance === 'present' ? (
                  <span className="text-green-700 text-xs font-medium">Present</span>
                ) : (
                  <span className="text-red-700 text-xs font-medium">Absent</span>
                )}
                {isEditing && (
                  <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-1 rounded-full leading-none font-medium">
                    Editing
                  </span>
                )}
                {hasSubmittedAttendance && !isEditing && (
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full leading-none font-medium">
                    Submitted
                  </span>
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
                disabled={isDisabled}
              />
            )}
            
            {/* Edit/Cancel/Save buttons - only show if attendance exists and can edit */}
            {hasAttendance && hasSubmittedAttendance && row.original._onEditModeChange && (
              <div className="ml-2 flex gap-1">
                {isEditing ? (
                  <>
                    {/* Save button - only show if there are unsaved changes */}
                    {student._hasUnsavedChanges && onSaveIndividualAttendance && (
                      <button
                        className="w-7 h-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors flex-shrink-0"
                        aria-label={`Save changes for ${student.firstName} ${student.lastName}`}
                        onClick={() => {
                          onSaveIndividualAttendance(student.id)
                        }}
                      >
                        <Save size={14} />
                      </button>
                    )}
                    {/* Cancel button */}
                    <button
                      className="w-7 h-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0"
                      aria-label={`Cancel editing ${student.firstName} ${student.lastName}`}
                      onClick={() => {
                        row.original._onEditModeChange?.(student.id, false)
                      }}
                    >
                      <XCircle size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors flex-shrink-0"
                    aria-label={`Edit attendance for ${student.firstName} ${student.lastName}`}
                    onClick={() => {
                      row.original._onEditModeChange?.(student.id, true)
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        )
      },
    },
  ];

  // Add survey column
  if (session && trainingId) {
    // Only add survey column if session is first or last
    if (session.first || session.last) {
      columns.push({
        accessorKey: "survey",
        header: "Survey",
        cell: ({ row }) => {
          const student = row.original;
          const fullName = `${student.firstName} ${student.lastName}`;
          
          // Determine if this is a pre or post session survey
          const isPreSession = session.first === true;
          
          return (
            <SurveyButton 
              trainingId={trainingId}
              studentId={student.id}
              studentName={fullName}
              isPreSession={isPreSession}
              disabled={false}
            />
          );
        },
      });
    }
  }

  // Only add assessment column if session has first or last flag
  if (session && (session.first || session.last)) {
    columns.push({
      accessorKey: "assessment",
      header: "Assessment",
      cell: ({ row }) => {
        const student = row.original;
        const fullName = `${student.firstName} ${student.lastName}`;
        
        // Add a SessionAssessmentWrapper component to handle fetching assessments
        return <SessionAssessmentCell 
          sessionId={sessionId} 
          student={student}
          canEditAssessment={canEditAssessment}
          isDisabled={false}
          session={session}
          trainingId={trainingId}
        />;
      },
    });
  }
  
  // Append any extra columns provided (future-proofing for new inline forms)
  if (extras.length) {
    columns.push(...extras);
  }
  
  return columns;
};

// New component to handle assessment display with data fetching
function SessionAssessmentCell({ 
  sessionId, 
  student, 
  canEditAssessment,
  isDisabled,
  session,
  trainingId
}: { 
  sessionId: string;
  student: AttendanceStudent;
  canEditAssessment: boolean;
  isDisabled: boolean;
  session?: Session;
  trainingId?: string;
}) {
  const fullName = `${student.firstName} ${student.lastName}`;
  
  if (!sessionId || !session) {
    return <span className="text-xs text-gray-400">Session not available</span>;
  }
  
  if (!canEditAssessment) {
    return null; // Don't show anything for non-authorized roles
  }

  // Determine assessment type based on session flags
  const isFirstSession = session.first;
  const isLastSession = session.last;
  
  // If session is neither first nor last, don't show assessment
  if (!isFirstSession && !isLastSession) {
    return null;
  }
  
  // Check if the student has filled any assessment
  const hasFilledAssessment = typeof student.answerFileLink === 'string' && student.answerFileLink;
  
  // Use the passed trainingId or fallback
  const effectiveTrainingId = trainingId || '';
  
  // Determine the assessment type and labels
  const assessmentType = isFirstSession ? 'PRE' : 'POST';
  const assessmentTypeLabel = isFirstSession ? 'Pre' : 'Post';
  const filledLabel = isFirstSession ? 'Pre-assessment filled' : 'Post-assessment filled';
  const buttonLabel = hasFilledAssessment 
    ? `View/Edit ${assessmentTypeLabel}` 
    : `Add ${assessmentTypeLabel}-Assessment`;
    
  return (
    <div className="flex items-center gap-2">
      {hasFilledAssessment && (
        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {filledLabel}
        </span>
      )}
      
      <AssessmentModal
        trainingId={effectiveTrainingId}
        studentId={student.id}
        studentName={fullName}
        assessmentType={assessmentType}
        trigger={
                  <Button
          variant="outline"
          className="text-blue-600 border-blue-600 text-xs h-7 px-2 hover:bg-blue-50"
          disabled={false}
        >
          {buttonLabel}
        </Button>
        }
      />
    </div>
  );
}

// Export a static version for compatibility with existing code
export const attendanceColumns = createAttendanceColumns(""); 