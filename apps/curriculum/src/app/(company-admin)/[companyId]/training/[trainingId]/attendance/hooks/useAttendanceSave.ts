import { useCallback, useState } from "react"
import { useSubmitAttendance, useSubmitBulkAttendance } from "@/lib/hooks/useAttendance"
import { toast } from "sonner"

interface Student {
  id: string
  firstName?: string
  lastName?: string
}

type AttendanceRecord = {
  status?: 'present' | 'absent'
  comment: string
  attendanceId?: string
}

type AttendanceAction = 
  | { type: 'clearSaved'; studentIds: string[] }
  | { type: 'update'; studentId: string; data: Partial<AttendanceRecord> }
  | { type: 'reset' }

interface UseAttendanceSaveProps {
  activeSessionId: string
  attendanceData: Record<string, AttendanceRecord>
  students: Student[]
  studentsWithChanges: string[]
  dispatchAttendance: (action: AttendanceAction) => void
  setSelectedStudents: (fn: (prev: Set<string>) => Set<string>) => void
  setEditingStudents: (fn: (prev: Set<string>) => Set<string>) => void
  refetchStudents: () => Promise<unknown>
  refetchAttendance: () => Promise<unknown>
}

export function useAttendanceSave({
  activeSessionId,
  attendanceData,
  students,
  studentsWithChanges,
  dispatchAttendance,
  setSelectedStudents,
  setEditingStudents,
  refetchStudents,
  refetchAttendance
}: UseAttendanceSaveProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { mutate: submitAttendance, isPending: isSavingAttendance } = useSubmitAttendance()
  const { mutate: submitBulkAttendance, isPending: isSavingBulkAttendance } = useSubmitBulkAttendance()

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
          dispatchAttendance({ type: 'clearSaved', studentIds: [studentId] });
          setSelectedStudents(prev => {
            const newSet = new Set(prev);
            newSet.delete(studentId);
            return newSet;
          });
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
  }, [activeSessionId, attendanceData, students, submitAttendance, refetchStudents, refetchAttendance, dispatchAttendance, setSelectedStudents, setEditingStudents]);

  const handleSaveAttendance = useCallback(async () => {
    if (!activeSessionId || studentsWithChanges.length === 0) return;

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
            dispatchAttendance({ type: 'clearSaved', studentIds: [studentId] });
            setSelectedStudents(prev => {
              const newSet = new Set(prev);
              newSet.delete(studentId);
              return newSet;
            });
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
            dispatchAttendance({ type: 'clearSaved', studentIds: studentsWithChanges });
            setSelectedStudents(prev => {
              const newSet = new Set(prev);
              studentsWithChanges.forEach(studentId => newSet.delete(studentId));
              return newSet;
            });
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
  }, [activeSessionId, studentsWithChanges, attendanceData, submitAttendance, submitBulkAttendance, refetchStudents, refetchAttendance, students, dispatchAttendance, setSelectedStudents, setEditingStudents]);

  return {
    isSaving,
    isSavingAttendance,
    isSavingBulkAttendance,
    handleSaveIndividualAttendance,
    handleSaveAttendance
  }
}

