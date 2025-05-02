"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { Filter } from "lucide-react"
import { useSessions, useAssignedStudentsForSession } from "@/lib/hooks/useSession"
import { AttendanceStudent, createAttendanceColumns } from "../attendance/components/attendance-columns"
import { AttendanceDataTable } from "../attendance/components/attendance-data-table"
import { SessionTabs } from "../attendance/components/session-tabs"
import { useSubmitAttendance } from "@/lib/hooks/useAttendance"
import { Student } from "@/lib/hooks/useStudents"
import { toast } from "sonner"

// Extended Student type to include attendance information from API
interface StudentWithAttendance extends Student {
  isPresent: boolean | null;
  comment?: string;
  attendanceId?: string;
}

interface AttendanceComponentProps {
  trainingId: string
}

export function AttendanceComponent({ trainingId }: AttendanceComponentProps) {
  const router = useRouter()
  const params = useParams()
  const { isProjectManager, isTrainingAdmin, isTrainer } = useUserRole()
  const [activeSessionId, setActiveSessionId] = useState<string>("")
  const [studentPage, setStudentPage] = useState(1)
  const [studentPageSize, setStudentPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: 'present' | 'absent', comment: string, attendanceId?: string }>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const previousSessionIdRef = useRef<string>("");
  const [unsavedStudentId, setUnsavedStudentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false)
  const [pendingSubmissions, setPendingSubmissions] = useState<string[]>([]);

  // Fetch sessions for this training
  const { 
    data: sessionsData, 
    isLoading: isLoadingSessions, 
    error: sessionsError 
  } = useSessions({
    trainingIds: [trainingId],
    pageSize: 20,
    page: 0
  })
  
  const sessions = sessionsData?.sessions || []

  // Set the first session as active when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  // Fetch students for the active session - this now includes attendance data with isPresent flag
  const { 
    data: studentData, 
    isLoading: isLoadingStudents, 
    error: studentError,
    refetch: refetchStudents
  } = useAssignedStudentsForSession(
    activeSessionId,
    studentPage,
    studentPageSize
  )

  // Initialize attendance data from student records
  useEffect(() => {
    if (studentData?.trainees && studentData.trainees.length > 0) {
      const newAttendanceData: Record<string, { status: 'present' | 'absent', comment: string, attendanceId?: string }> = {};
      
      studentData.trainees.forEach(student => {
        // Check if the student has attendance data
        const typedStudent = student as unknown as StudentWithAttendance;
        
        if (student.id && typedStudent.isPresent !== null && typedStudent.isPresent !== undefined) {
          newAttendanceData[student.id] = {
            status: typedStudent.isPresent ? 'present' : 'absent',
            comment: typedStudent.comment || '',
            attendanceId: typedStudent.attendanceId
          };
        }
      });
      
      // Set initial data without comparing, as we want to load fresh data
      setAttendanceData(newAttendanceData);
      
      setHasUnsavedChanges(false); // Reset change tracking after loading data
      setUnsavedStudentId(null); // Reset unsaved student on data load
    } else {
      // Clear data if no trainees
      setAttendanceData({});
      setHasUnsavedChanges(false);
      setUnsavedStudentId(null);
    }
  }, [studentData]); 

  // Reset attendance data when changing sessions
  useEffect(() => {
    if (previousSessionIdRef.current && previousSessionIdRef.current !== activeSessionId) {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm("You have unsaved attendance changes for a student. Do you want to discard them?");
        if (confirmed) {
          setAttendanceData({});
          setHasUnsavedChanges(false);
          setUnsavedStudentId(null);
        } else {
          setActiveSessionId(previousSessionIdRef.current);
          return;
        }
      } else {
        setAttendanceData({});
        setUnsavedStudentId(null); // Also clear unsaved student when changing session without unsaved changes
      }
    }
    
    previousSessionIdRef.current = activeSessionId;
  }, [activeSessionId, hasUnsavedChanges]);

  const students = studentData?.trainees || [];
  
  // Handle attendance change - modified for single student edits
  const handleAttendanceChange = useCallback((studentId: string, status: 'present' | 'absent') => {
    // Prevent changing another student if one already has unsaved changes
    if (hasUnsavedChanges && unsavedStudentId !== studentId) {
      toast.error("Unsaved Changes", {
        description: "Please save the current student's attendance before modifying another."
      });
      return;
    }
    
    let previousStatus: 'present' | 'absent' | undefined;
    let statusChanged = false;
    
    setAttendanceData(prev => {
      const existingRecord = prev[studentId];
      previousStatus = existingRecord?.status;
      
      // Update only if status actually changed
      if (existingRecord?.status === status) return prev;
      
      statusChanged = true;
      return {
        ...prev,
        [studentId]: {
          ...(existingRecord || { comment: '' }), // Ensure comment exists if creating new record
          status: status
        }
      };
    });
    
    // Mark changes and track the student if status changed
    if (statusChanged) {
      setHasUnsavedChanges(true);
      setUnsavedStudentId(studentId);
    }
  }, [hasUnsavedChanges, unsavedStudentId]);

  // Handle comment change - modified for single student edits
  const handleCommentChange = useCallback((studentId: string, comment: string) => {
    // Prevent changing another student if one already has unsaved changes
    if (hasUnsavedChanges && unsavedStudentId !== studentId) {
      toast.error("Unsaved Changes", {
        description: "Please save the current student's attendance before modifying another."
      });
      return;
    }
    
    let commentChanged = false;

    setAttendanceData(prev => {
      const existingRecord = prev[studentId] || { status: undefined, comment: '' }; // Provide default status if needed
      
      // Only update if comment actually changed
      if (existingRecord.comment === comment) return prev;

      commentChanged = true;
      return {
        ...prev,
        [studentId]: {
          ...existingRecord,
          comment
        }
      };
    });
    
    // Mark changes and track the student if comment changed
    if (commentChanged) {
      setHasUnsavedChanges(true);
      setUnsavedStudentId(studentId);
    }
  }, [hasUnsavedChanges, unsavedStudentId]);
  
  // Map the student data to AttendanceStudent format - memoized to prevent recalculation
  const attendanceStudents = useMemo(() => students.map(student => {
    const studentAttendance = attendanceData[student.id];
    const typedStudent = student as unknown as StudentWithAttendance;
    const hasRecordedAttendance = typedStudent.isPresent !== null && typedStudent.isPresent !== undefined;
    
    // Determine the effective attendance and comment based on unsaved state
    let effectiveAttendance: 'present' | 'absent' | undefined;
    let effectiveComment: string = typedStudent.comment || '';

    if (hasUnsavedChanges && unsavedStudentId === student.id && studentAttendance) {
      // Use local state if this student has unsaved changes
      effectiveAttendance = studentAttendance.status;
      effectiveComment = studentAttendance.comment || '';
    } else if (hasRecordedAttendance) {
      // Use API data if no unsaved changes for this student
      effectiveAttendance = typedStudent.isPresent ? 'present' : 'absent';
    } else if (studentAttendance) {
       // Use local state if it exists (e.g., comment added without changing status)
       effectiveAttendance = studentAttendance.status;
       effectiveComment = studentAttendance.comment || '';
    }
    
    return {
      id: student.id,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      sessionDate: sessions.find(s => s.id === activeSessionId)?.startDate || '',
      attendance: effectiveAttendance,
      comment: effectiveComment,
      attendanceId: typedStudent.attendanceId,
      _onAttendanceChange: handleAttendanceChange,
      _onCommentChange: handleCommentChange,
      _isProcessing: pendingSubmissions.includes(student.id),
      _isDisabled: hasUnsavedChanges && unsavedStudentId !== student.id 
    }
  }), [
    students, 
    attendanceData, 
    activeSessionId, 
    sessions, 
    handleAttendanceChange, 
    handleCommentChange, 
    hasUnsavedChanges, 
    pendingSubmissions,
    unsavedStudentId
  ]);
  
  // Filter students based on search query - memoized to prevent recalculation
  const filteredStudents = useMemo(() => 
    searchQuery 
      ? attendanceStudents.filter(student => 
          student?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : attendanceStudents,
    [attendanceStudents, searchQuery]
  );

  // Pagination data - memoized to prevent recalculation
  const totalStudentElements = useMemo(() => 
    studentData?.totalElements || filteredStudents.length,
    [studentData?.totalElements, filteredStudents.length]
  );
  
  const totalStudentPages = useMemo(() => 
    studentData?.totalPages || Math.ceil(totalStudentElements / studentPageSize),
    [studentData?.totalPages, totalStudentElements, studentPageSize]
  );

  // Handle page size change
  const handleStudentPageSizeChange = useCallback((newPageSize: number) => {
    setStudentPageSize(newPageSize)
    setStudentPage(1) // Reset to first page when changing page size
  }, []);

  // Replace bulk mutation with single attendance mutation
  const { mutate: submitAttendance, isPending: isSavingAttendance } = useSubmitAttendance();

  // Handle save attendance for the single student with unsaved changes
  const handleSaveAttendance = useCallback(async () => {
    if (!activeSessionId || !unsavedStudentId || !hasUnsavedChanges) return;

    const attendanceToSave = attendanceData[unsavedStudentId];
    if (!attendanceToSave) {
      console.error("Could not find attendance data for unsaved student:", unsavedStudentId);
      toast.error("Error saving attendance", { description: "Could not find data to save." });
      return;
    }

    // Check if status is defined before saving
    if (attendanceToSave.status === undefined) {
       toast.error("Cannot Save", {
         description: "Please mark the student as 'Present' or 'Absent' before saving."
       });
       return;
    }

    setIsSaving(true);
    const studentToSave = students.find(s => s.id === unsavedStudentId); // For toast message
    const studentName = studentToSave ? `${studentToSave.firstName} ${studentToSave.lastName}` : `Student ID ${unsavedStudentId}`;
    
    submitAttendance(
      {
        traineeId: unsavedStudentId,
        sessionId: activeSessionId,
        present: attendanceToSave.status === 'present',
        comment: attendanceToSave.comment || ''
      },
      {
        onSuccess: async () => {
          toast.success(`Attendance saved for ${studentName}`);
          setHasUnsavedChanges(false);
          setUnsavedStudentId(null);
          await refetchStudents(); // Refresh data after saving
        },
        onError: (error) => {
          console.error("Error saving attendance:", error);
          toast.error("Error saving attendance", {
            description: `Could not save attendance for ${studentName}. Please try again.`
          });
        },
        onSettled: () => {
          setIsSaving(false);
        }
      }
    );
  }, [activeSessionId, unsavedStudentId, hasUnsavedChanges, attendanceData, submitAttendance, refetchStudents, students]);

  // Memoize the attendance columns to prevent recreation on each render
  const memoizedColumns = useMemo(() => 
    createAttendanceColumns(activeSessionId),
    [activeSessionId]
  );

  const isLoading = isLoadingSessions || isLoadingStudents;

  // Header section with title, now without search
  const headerSection = (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-xl font-semibold">Attendance</h1>
    </div>
  )

  if (isLoading && !sessionsData) {
    return <Loading />
  }

  if (sessionsError) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}

        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">Error Loading Sessions</h3>
          <p className="text-gray-500 text-sm">
            There was a problem loading the sessions. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}

        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Sessions Available</h3>
          <p className="text-gray-500 text-sm">
            No sessions are available to take attendance. Please add sessions to the training program first.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-[7%] py-10">
      {headerSection}
      
      {/* Session tabs component */}
      <SessionTabs 
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        trainingId={trainingId}
      />
      
      {/* Student Attendance Table */}
      {studentError ? (
        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border border-[#EAECF0]">
          <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
          <p className="text-gray-500 text-sm">
            There was a problem loading the required data. Please try again later.
          </p>
        </div>
      ) : activeSessionId && !isLoadingStudents && students.length === 0 ? (
        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border border-[#EAECF0]">
          <h3 className="text-lg font-medium mb-2">No Students Assigned</h3>
          <p className="text-gray-500 text-sm">
            No students are assigned to this session. Assign students to track attendance.
          </p>
        </div>
      ) : (
        <AttendanceDataTable
          columns={memoizedColumns}
          data={filteredStudents}
          isLoading={isLoadingStudents}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pagination={{
            totalPages: totalStudentPages,
            currentPage: studentPage,
            setPage: setStudentPage,
            pageSize: studentPageSize,
            setPageSize: handleStudentPageSizeChange,
            totalElements: totalStudentElements
          }}
          isSaving={isSaving || isSavingAttendance}
          onSaveAttendance={handleSaveAttendance}
          hasUnsavedChanges={hasUnsavedChanges}
          sessionId={activeSessionId}
          unsavedStudentId={unsavedStudentId}
        />
      )}
    </div>
  )
} 