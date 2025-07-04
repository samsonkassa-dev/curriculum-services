"use client"

import { useState, useEffect, useCallback, useRef, useMemo, useReducer } from "react"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Loading } from "@/components/ui/loading"
import { useCohortSessions } from "@/lib/hooks/useSession"
import { useCohorts, useCohortTrainees } from "@/lib/hooks/useCohorts"
import { createAttendanceColumns } from "../attendance/components/attendance-columns"
import { AttendanceDataTable } from "../attendance/components/attendance-data-table"
import { CohortSessionTabs } from "../attendance/components/cohort-session-tabs"
import { useSubmitAttendance, useSubmitBulkAttendance, useSessionAttendance } from "@/lib/hooks/useAttendance"
import { Student } from "@/lib/hooks/useStudents"
import { toast } from "sonner"

// Extended Student type to include attendance information from API
interface StudentWithAttendance extends Student {
  isPresent: boolean | null;
  comment?: string;
  attendanceId?: string;
  answerFileLink?: string | null;
}

interface AttendanceComponentProps {
  trainingId: string
}

// -----------------------------
// Attendance local state helper
// -----------------------------

type AttendanceRecord = {
  status?: 'present' | 'absent'
  comment: string
  attendanceId?: string
}

interface AttendanceState {
  data: Record<string, AttendanceRecord>
  dirty: boolean
  pendingId: string | null
}

type AttendanceAction =
  | { type: 'load'; payload: Record<string, AttendanceRecord> }
  | { type: 'edit'; studentId: string; data: Partial<AttendanceRecord> }
  | { type: 'reset' }
  | { type: 'clearSaved'; studentIds: string[] }

function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'load':
      return { data: action.payload, dirty: false, pendingId: null }
    case 'edit': {
      const prev = state.data[action.studentId] || { comment: '' }
      const next = { ...prev, ...action.data }
      const changed = prev.status !== next.status || prev.comment !== next.comment
      if (!changed) return state

      return {
        data: { ...state.data, [action.studentId]: next },
        dirty: true,
        pendingId: action.studentId,
      }
    }
    case 'reset':
      return { data: {}, dirty: false, pendingId: null }
    case 'clearSaved': {
      const newData = { ...state.data }
      action.studentIds.forEach(studentId => {
        delete newData[studentId]
      })
      const hasPendingData = Object.keys(newData).length > 0
      return {
        data: newData,
        dirty: hasPendingData,
        pendingId: hasPendingData ? state.pendingId : null
      }
    }
    default:
      return state
  }
}

export function AttendanceComponent({ trainingId }: AttendanceComponentProps) {
  const { isProjectManager, isTrainingAdmin, isTrainer, isLoading: isLoadingAuth } = useUserRole()
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
  const canEditAssessment = !isLoadingAuth && (isTrainer || isTrainingAdmin || isProjectManager) && isInitialLoadComplete
  const [activeCohortId, setActiveCohortId] = useState<string>("")
  const [activeSessionId, setActiveSessionId] = useState<string>("")
  const [studentPage, setStudentPage] = useState(1)
  const [studentPageSize, setStudentPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [editingStudents, setEditingStudents] = useState<Set<string>>(new Set())
  const [attendanceState, dispatchAttendance] = useReducer(attendanceReducer, {
    data: {},
    dirty: false,
    pendingId: null,
  })

  const attendanceData = attendanceState.data
  const hasUnsavedChanges = attendanceState.dirty
  const unsavedStudentId = attendanceState.pendingId

  const previousSessionIdRef = useRef<string>("");
  const isInitializedRef = useRef(false)

  // Local helpers for network UI states
  const [isSaving, setIsSaving] = useState(false)
  const [pendingSubmissions, setPendingSubmissions] = useState<string[]>([])

  // Fetch cohorts for this training
  const { 
    data: cohortsData, 
    isLoading: isLoadingCohorts, 
    error: cohortsError 
  } = useCohorts({
    trainingId,
    pageSize: 20,
    page: 1
  })
  
  const cohorts = cohortsData?.cohorts || []

  // Fetch sessions for the active cohort
  const { 
    data: sessionsData, 
    isLoading: isLoadingSessions, 
    error: sessionsError 
  } = useCohortSessions({
    cohortId: activeCohortId,
    pageSize: 20,
    page: 1
  })
  
  const sessions = sessionsData?.sessions || []

  // Initialize first cohort and session - only once when data is available
  useEffect(() => {
    if (!isInitializedRef.current && cohorts.length > 0) {
      setActiveCohortId(cohorts[0].id)
      isInitializedRef.current = true
    }
  }, [cohorts.length])

  // Set first session when sessions load for the active cohort
  useEffect(() => {
    if (activeCohortId && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
      setIsInitialLoadComplete(true)  // Mark initial load as complete
    }
  }, [activeCohortId, sessions, activeSessionId])

  // Handle cohort change - reset session and clear data
  const handleCohortChange = useCallback((newCohortId: string) => {
    if (newCohortId !== activeCohortId) {
      setActiveCohortId(newCohortId)
      setActiveSessionId("") // Reset session when cohort changes
      dispatchAttendance({ type: 'reset' })
      setEditingStudents(new Set()) // Clear edit states
    }
  }, [activeCohortId])

  // Handle session change
  const handleSessionChange = useCallback((newSessionId: string) => {
    if (newSessionId !== activeSessionId) {
      // Always allow session change, no confirmation dialog
      setActiveSessionId(newSessionId)
      dispatchAttendance({ type: 'reset' })
      setEditingStudents(new Set()) // Clear edit states
    }
  }, [activeSessionId])

  // Fetch students for the active cohort (not session)
  const { 
    data: studentData, 
    isLoading: isLoadingStudents, 
    error: studentError,
    refetch: refetchStudents
  } = useCohortTrainees(
    activeCohortId,
    studentPage,
    studentPageSize,
    { noCohorts: true }
  )

  // Fetch attendance data for the active session
  const { 
    data: attendanceResponse, 
    isLoading: isLoadingAttendance, 
    error: attendanceError,
    refetch: refetchAttendance
  } = useSessionAttendance(activeSessionId)

  // Initialize attendance data from session attendance API
  useEffect(() => {
    if (attendanceResponse?.attendance) {
      // Only load API data if we don't have unsaved changes
      // This prevents overwriting user's current edits
      if (!hasUnsavedChanges) {
        const newAttendanceData: Record<string, AttendanceRecord> = {};
        
        attendanceResponse.attendance.forEach(record => {
          if (record.trainee?.id) {
            newAttendanceData[record.trainee.id] = {
              status: record.isPresent ? 'present' : 'absent',
              comment: record.comment || '',
              attendanceId: record.id
            };
          }
        });
        
        dispatchAttendance({ type: 'load', payload: newAttendanceData })
      }
    } else if (attendanceResponse && attendanceResponse.attendance && attendanceResponse.attendance.length === 0) {
      // Handle empty attendance array - reset to clean state only if no unsaved changes
      if (!hasUnsavedChanges) {
        dispatchAttendance({ type: 'reset' })
      }
    }
  }, [attendanceResponse, hasUnsavedChanges]); 

  const students = studentData?.trainees || [];

  // Get students with unsaved changes (comparing local state vs API state)
  const studentsWithChanges = useMemo(() => {
    return Object.keys(attendanceData).filter(studentId => {
      const localRecord = attendanceData[studentId];
      if (!localRecord || localRecord.status === undefined) return false;
      
      // Find the corresponding saved attendance record from API
      const apiRecord = attendanceResponse?.attendance?.find(
        record => record.trainee?.id === studentId
      );
      
      // If no API record exists, this is a new unsaved change
      if (!apiRecord) return true;
      
      // Compare local state with API state
      const apiStatus = apiRecord.isPresent ? 'present' : 'absent';
      const apiComment = apiRecord.comment || '';
      
      const hasStatusChange = localRecord.status !== apiStatus;
      const hasCommentChange = (localRecord.comment || '') !== apiComment;
      
      return hasStatusChange || hasCommentChange;
    });
  }, [attendanceData, attendanceResponse]);
  
  // Handle student selection for multi-select
  const handleStudentSelection = useCallback((studentId: string, selected: boolean) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(studentId)
      } else {
        newSet.delete(studentId)
      }
      return newSet
    })
  }, [])

  // Handle edit mode change for individual students
  const handleEditModeChange = useCallback((studentId: string, editing: boolean) => {
    setEditingStudents(prev => {
      const newSet = new Set(prev)
      if (editing) {
        newSet.add(studentId)
      } else {
        newSet.delete(studentId)
        // If canceling edit, remove any unsaved changes for this student
        // This will revert to the API state
        dispatchAttendance({ type: 'clearSaved', studentIds: [studentId] })
      }
      return newSet
    })
  }, [])

  // Handle attendance change - now allows multiple students
  const handleAttendanceChange = useCallback((studentId: string, status: 'present' | 'absent') => {
    const existingRecord = attendanceData[studentId]
    if (existingRecord?.status === status) return

    dispatchAttendance({ type: 'edit', studentId, data: { status } })
  }, [attendanceData]);

  // Handle comment change - now allows multiple students
  const handleCommentChange = useCallback((studentId: string, comment: string) => {
    const existingRecord = attendanceData[studentId] || { status: undefined, comment: '' }
    if (existingRecord.comment === comment) return

    dispatchAttendance({ type: 'edit', studentId, data: { comment } })
  }, [attendanceData]);
  
  // Map the student data to AttendanceStudent format - memoized to prevent recalculation
  const attendanceStudents = useMemo(() => students.map(student => {
    const studentAttendance = attendanceData[student.id];
    
    // Find the corresponding attendance record from API
    const attendanceRecord = attendanceResponse?.attendance?.find(
      record => record.trainee?.id === student.id
    );
    
    // Determine the effective attendance and comment based on local state or API data
    let effectiveAttendance: 'present' | 'absent' | undefined;
    let effectiveComment: string = '';

    if (studentAttendance) {
      // Use local state if it exists (user made changes)
      effectiveAttendance = studentAttendance.status;
      effectiveComment = studentAttendance.comment || '';
    } else if (attendanceRecord) {
      // Use API data if no local changes
      effectiveAttendance = attendanceRecord.isPresent ? 'present' : 'absent';
      effectiveComment = attendanceRecord.comment || '';
    }
    
    return {
      id: student.id,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      sessionDate: sessions.find(s => s.id === activeSessionId)?.startDate || '',
      attendance: effectiveAttendance,
      comment: effectiveComment,
      attendanceId: attendanceRecord?.id || studentAttendance?.attendanceId,
      answerFileLink: null, // We'll handle assessments separately
      _onAttendanceChange: handleAttendanceChange,
      _onCommentChange: handleCommentChange,
      _onSelectionChange: handleStudentSelection,
      _onEditModeChange: handleEditModeChange,
      _isProcessing: pendingSubmissions.includes(student.id),
      _isSelected: selectedStudents.has(student.id),
      _isEditing: editingStudents.has(student.id),
      _hasUnsavedChanges: studentsWithChanges.includes(student.id)
    }
  }), [
    students, 
    attendanceData, 
    attendanceResponse,
    activeSessionId, 
    sessions, 
    handleAttendanceChange, 
    handleCommentChange, 
    handleStudentSelection,
    handleEditModeChange,
    pendingSubmissions,
    selectedStudents,
    editingStudents,
    studentsWithChanges
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

  // Individual and bulk attendance mutations
  const { mutate: submitAttendance, isPending: isSavingAttendance } = useSubmitAttendance();
  const { mutate: submitBulkAttendance, isPending: isSavingBulkAttendance } = useSubmitBulkAttendance();

  // Handle save attendance for individual student (used in edit mode)
  const handleSaveIndividualAttendance = useCallback(async (studentId: string) => {
    if (!activeSessionId || !attendanceData[studentId]) return;

    const attendanceToSave = attendanceData[studentId];
    const studentToSave = students.find(s => s.id === studentId);
    const studentName = studentToSave ? `${studentToSave.firstName} ${studentToSave.lastName}` : `Student ID ${studentId}`;
    
    if (!attendanceToSave.status) {
      toast.error("Cannot Save", {
        description: "Please mark the student as 'Present' or 'Absent' before saving."
      });
      return;
    }

    setIsSaving(true);
    
    submitAttendance(
      {
        traineeId: studentId,
        sessionId: activeSessionId,
        present: attendanceToSave.status === 'present',
        comment: attendanceToSave.comment || ''
      },
      {
        onSuccess: async () => {
          toast.success(`Attendance saved for ${studentName}`);
          // Clear local state for this saved student
          dispatchAttendance({ type: 'clearSaved', studentIds: [studentId] });
          // Clear selection for this specific student only
          setSelectedStudents(prev => {
            const newSet = new Set(prev);
            newSet.delete(studentId);
            return newSet;
          });
          // Exit edit mode for this student
          setEditingStudents(prev => {
            const newSet = new Set(prev);
            newSet.delete(studentId);
            return newSet;
          });
          await Promise.all([refetchStudents(), refetchAttendance()]);
        },
        onError: (error) => {
          console.log("Error saving attendance:", error);
          toast.error("Error saving attendance", {
            description: `Could not save attendance for ${studentName}. Please try again.`
          });
        },
        onSettled: () => {
          setIsSaving(false);
        }
      }
    );
  }, [activeSessionId, attendanceData, students, submitAttendance, refetchStudents, refetchAttendance]);

  // Handle save attendance - supports both single and bulk
  const handleSaveAttendance = useCallback(async () => {
    if (!activeSessionId || studentsWithChanges.length === 0) return;

    // Check if all students with changes have a status defined
    const invalidStudents = studentsWithChanges.filter(studentId => {
      const record = attendanceData[studentId];
      return !record || record.status === undefined;
    });

    if (invalidStudents.length > 0) {
      toast.error("Cannot Save", {
        description: "Please mark all students as 'Present' or 'Absent' before saving."
      });
      return;
    }

    setIsSaving(true);

    if (studentsWithChanges.length === 1) {
      // Single student save
      const studentId = studentsWithChanges[0];
      const attendanceToSave = attendanceData[studentId];
      const studentToSave = students.find(s => s.id === studentId);
      const studentName = studentToSave ? `${studentToSave.firstName} ${studentToSave.lastName}` : `Student ID ${studentId}`;
      
      submitAttendance(
        {
          traineeId: studentId,
          sessionId: activeSessionId,
          present: attendanceToSave.status === 'present',
          comment: attendanceToSave.comment || ''
        },
        {
          onSuccess: async () => {
            toast.success(`Attendance saved for ${studentName}`);
            // Clear local state for this saved student
            dispatchAttendance({ type: 'clearSaved', studentIds: [studentId] });
            // Clear selection for this specific student only
            setSelectedStudents(prev => {
              const newSet = new Set(prev);
              newSet.delete(studentId);
              return newSet;
            });
            // Exit edit mode for this student
            setEditingStudents(prev => {
              const newSet = new Set(prev);
              newSet.delete(studentId);
              return newSet;
            });
            await Promise.all([refetchStudents(), refetchAttendance()]);
          },
          onError: (error) => {
            console.log("Error saving attendance:", error);
            toast.error("Error saving attendance", {
              description: `Could not save attendance for ${studentName}. Please try again.`
            });
          },
          onSettled: () => {
            setIsSaving(false);
          }
        }
      );
    } else {
      // Bulk save
      const attendanceRecords = studentsWithChanges.map(studentId => ({
        traineeId: studentId,
        present: attendanceData[studentId].status === 'present',
        comment: attendanceData[studentId].comment || ''
      }));

      submitBulkAttendance(
        {
          sessionId: activeSessionId,
          attendanceRecords
        },
        {
          onSuccess: async () => {
            toast.success(`Attendance saved for ${studentsWithChanges.length} students`);
            // Clear local state for saved students
            dispatchAttendance({ type: 'clearSaved', studentIds: studentsWithChanges });
            // Clear selections for saved students only
            setSelectedStudents(prev => {
              const newSet = new Set(prev);
              studentsWithChanges.forEach(studentId => newSet.delete(studentId));
              return newSet;
            });
            // Exit edit mode for all saved students
            setEditingStudents(prev => {
              const newSet = new Set(prev);
              studentsWithChanges.forEach(studentId => newSet.delete(studentId));
              return newSet;
            });
            await Promise.all([refetchStudents(), refetchAttendance()]);
          },
          onError: (error) => {
            console.log("Error saving bulk attendance:", error);
            toast.error("Error saving attendance", {
              description: `Could not save attendance for ${studentsWithChanges.length} students. Please try again.`
            });
          },
          onSettled: () => {
            setIsSaving(false);
          }
        }
      );
    }
  }, [activeSessionId, studentsWithChanges, attendanceData, submitAttendance, submitBulkAttendance, refetchStudents, students, dispatchAttendance]);

  // Find the current session object
  const currentSession = sessions.find(session => session.id === activeSessionId);

  // Get IDs of students who have submitted attendance (from API)
  const submittedAttendanceIds = useMemo(() => {
    const ids = new Set<string>();
    if (attendanceResponse?.attendance) {
      attendanceResponse.attendance.forEach(record => {
        if (record.trainee?.id) {
          ids.add(record.trainee.id);
        }
      });
    }
    return ids;
  }, [attendanceResponse]);

  // Memoize the attendance columns to prevent recreation on each render
  const memoizedColumns = useMemo(() => 
    createAttendanceColumns(activeSessionId, canEditAssessment, currentSession, trainingId, [], hasUnsavedChanges, submittedAttendanceIds, handleSaveIndividualAttendance),
    [activeSessionId, canEditAssessment, currentSession, trainingId, hasUnsavedChanges, submittedAttendanceIds, handleSaveIndividualAttendance, isLoadingAuth]
  );

  // Comprehensive loading states
  const isInitialLoadingCohorts = isLoadingCohorts && cohorts.length === 0
  const isInitialLoadingSessions = isLoadingSessions && sessions.length === 0 && activeCohortId
  const isLoadingStudentsData = isLoadingStudents && !studentData
  const isLoadingAttendanceData = isLoadingAttendance && !attendanceResponse
  const isTableTransitioning = (isLoadingStudents && studentData) || (isLoadingAttendance && attendanceResponse) // When switching sessions/cohorts

  // Header section with title
  const headerSection = (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-xl font-semibold">Attendance</h1>
    </div>
  )

  // Show main loading during initial load
  if (isInitialLoadingCohorts) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}
        <Loading />
      </div>
    )
  }

  if (cohortsError) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}

        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">Error Loading Cohorts</h3>
          <p className="text-gray-500 text-sm">
            There was a problem loading the cohorts. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (cohorts.length === 0) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}

        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Cohorts Available</h3>
          <p className="text-gray-500 text-sm">
            No cohorts are available for attendance tracking. Please add cohorts to the training program first.
          </p>
        </div>
      </div>
    )
  }

  if (sessionsError) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}

        {/* Show cohort tabs even on session error */}
        <CohortSessionTabs 
          cohorts={cohorts}
          sessions={[]}
          activeCohortId={activeCohortId}
          activeSessionId=""
          setActiveCohortId={handleCohortChange}
          setActiveSessionId={handleSessionChange}
          trainingId={trainingId}
        />

        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">Error Loading Sessions</h3>
          <p className="text-gray-500 text-sm">
            There was a problem loading the sessions for this cohort. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (activeCohortId && sessions.length === 0 && !isInitialLoadingSessions) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}
        
        {/* Cohort tabs even when no sessions */}
        <CohortSessionTabs 
          cohorts={cohorts}
          sessions={sessions}
          activeCohortId={activeCohortId}
          activeSessionId={activeSessionId}
          setActiveCohortId={handleCohortChange}
          setActiveSessionId={handleSessionChange}
          trainingId={trainingId}
        />

        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Sessions Available</h3>
          <p className="text-gray-500 text-sm">
            No sessions are available in this cohort for attendance tracking. Please add sessions to this cohort first.
          </p>
        </div>
      </div>
    )
  }

  // Show loading while sessions are loading for initial load
  if (isInitialLoadingSessions) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}
        
        {/* Show cohort tabs */}
        <CohortSessionTabs 
          cohorts={cohorts}
          sessions={[]}
          activeCohortId={activeCohortId}
          activeSessionId=""
          setActiveCohortId={handleCohortChange}
          setActiveSessionId={handleSessionChange}
          trainingId={trainingId}
        />
        
        <div className="mt-8">
          <Loading />
        </div>
      </div>
    )
  }

  return (
    <div className="px-[7%] py-10">
      {headerSection}
      
      {/* Cohort and Session tabs component */}
      <CohortSessionTabs 
        cohorts={cohorts}
        sessions={sessions}
        activeCohortId={activeCohortId}
        activeSessionId={activeSessionId}
        setActiveCohortId={handleCohortChange}
        setActiveSessionId={handleSessionChange}
        trainingId={trainingId}
      />
      
      {/* Student Attendance Table */}
      {(studentError || attendanceError) ? (
        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border border-[#EAECF0]">
          <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
          <p className="text-gray-500 text-sm">
            {studentError && "There was a problem loading student data."} 
            {studentError && attendanceError && " "}
            {attendanceError && "There was a problem loading attendance data."} 
            Please try again later.
          </p>
        </div>
      ) : !activeSessionId ? (
        <div className="mt-8">
          <Loading />
        </div>
      ) : students.length === 0 && !isLoadingStudentsData && !isLoadingAttendanceData && !isTableTransitioning ? (
        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border border-[#EAECF0]">
          <h3 className="text-lg font-medium mb-2">No Students Assigned</h3>
          <p className="text-gray-500 text-sm">
            No students are available for this cohort. Add students to the cohort to track attendance.
          </p>
        </div>
      ) : (
        <AttendanceDataTable
          columns={memoizedColumns}
          data={filteredStudents}
          isLoading={isLoadingStudents || isLoadingAttendance} // Pass all loading states to the table component
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
          isSaving={isSaving || isSavingAttendance || isSavingBulkAttendance}
          onSaveAttendance={handleSaveAttendance}
          hasUnsavedChanges={hasUnsavedChanges}
          sessionId={activeSessionId}
          unsavedStudentId={null}
          studentsWithChanges={studentsWithChanges}
          isInitialLoadComplete={isInitialLoadComplete}
          canEditAttendance={canEditAssessment}
        />
      )}
    </div>
  )
} 


