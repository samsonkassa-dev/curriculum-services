import { useState, useEffect, useCallback, useMemo, useReducer } from "react"
import { useSessionAttendance } from "@/lib/hooks/useAttendance"

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

export function useAttendanceData(activeSessionId: string) {
  const [attendanceState, dispatchAttendance] = useReducer(attendanceReducer, {
    data: {},
    dirty: false,
    pendingId: null,
  })

  const attendanceData = attendanceState.data
  const hasUnsavedChanges = attendanceState.dirty

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
      if (!hasUnsavedChanges) {
        dispatchAttendance({ type: 'reset' })
      }
    }
  }, [attendanceResponse, hasUnsavedChanges]);

  // Get students with unsaved changes
  const studentsWithChanges = useMemo(() => {
    return Object.keys(attendanceData).filter(studentId => {
      const localRecord = attendanceData[studentId];
      if (!localRecord || localRecord.status === undefined) return false;
      
      const apiRecord = attendanceResponse?.attendance?.find(
        record => record.trainee?.id === studentId
      );
      
      if (!apiRecord) return true;
      
      const apiStatus = apiRecord.isPresent ? 'present' : 'absent';
      const apiComment = apiRecord.comment || '';
      
      const hasStatusChange = localRecord.status !== apiStatus;
      const hasCommentChange = (localRecord.comment || '') !== apiComment;
      
      return hasStatusChange || hasCommentChange;
    });
  }, [attendanceData, attendanceResponse]);

  // Get IDs of students who have submitted attendance
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

  const handleAttendanceChange = useCallback((studentId: string, status: 'present' | 'absent') => {
    const existingRecord = attendanceData[studentId]
    if (existingRecord?.status === status) return
    dispatchAttendance({ type: 'edit', studentId, data: { status } })
  }, [attendanceData]);

  const handleCommentChange = useCallback((studentId: string, comment: string) => {
    const existingRecord = attendanceData[studentId] || { status: undefined, comment: '' }
    if (existingRecord.comment === comment) return
    dispatchAttendance({ type: 'edit', studentId, data: { comment } })
  }, [attendanceData]);

  return {
    attendanceData,
    hasUnsavedChanges,
    studentsWithChanges,
    submittedAttendanceIds,
    attendanceResponse,
    isLoadingAttendance,
    attendanceError,
    refetchAttendance,
    dispatchAttendance,
    handleAttendanceChange,
    handleCommentChange
  }
}

