import { useCallback } from "react"
import { toast } from "sonner"
import {
  useSyncPreAssessment,
  useSyncPostAssessment,
  useSyncEnrollTrainees,
  useSyncCreateTrainees,
  useSyncPreAssessmentTraining,
  useSyncPostAssessmentTraining,
  useSyncEnrollTraineesTraining,
  useSyncCreateTraineesTraining,
  useSyncCompletion,
  useSyncCompletionTraining,
} from "@/lib/hooks/useSyncEdgeIntegration"

interface UseStudentSyncProps {
  trainingId: string
  getSelectedStudentIds: () => string[]
  clearSelection?: () => void
}

export function useStudentSync({ trainingId, getSelectedStudentIds, clearSelection }: UseStudentSyncProps) {
  // Sync hooks for selected students
  const { syncPreAssessmentAsync, isLoading: isSyncingPreAssessment } = useSyncPreAssessment()
  const { syncPostAssessmentAsync, isLoading: isSyncingPostAssessment } = useSyncPostAssessment()
  const { syncEnrollTraineesAsync, isLoading: isSyncingEnrollTrainees } = useSyncEnrollTrainees()
  const { syncCreateTraineesAsync, isLoading: isSyncingCreateTrainees } = useSyncCreateTrainees()
  const { syncCompletionAsync, isLoading: isSyncingCompletion } = useSyncCompletion()
  
  // Sync hooks for all students in training
  const { syncPreAssessmentTraining, isLoading: isSyncingPreAssessmentTraining } = useSyncPreAssessmentTraining()
  const { syncPostAssessmentTraining, isLoading: isSyncingPostAssessmentTraining } = useSyncPostAssessmentTraining()
  const { syncEnrollTraineesTraining, isLoading: isSyncingEnrollTraineesTraining } = useSyncEnrollTraineesTraining()
  const { syncCreateTraineesTraining, isLoading: isSyncingCreateTraineesTraining } = useSyncCreateTraineesTraining()
  const { syncCompletionTraining, isLoading: isSyncingCompletionTraining } = useSyncCompletionTraining()

  // Sync handlers for selected students
  const handleSyncPreAssessment = useCallback(async () => {
    const traineeIds = getSelectedStudentIds();
    if (traineeIds.length === 0) {
      toast.error('Please select students to sync');
      return;
    }
    await syncPreAssessmentAsync({ traineeIds });
    clearSelection?.();
  }, [getSelectedStudentIds, syncPreAssessmentAsync, clearSelection]);

  const handleSyncPostAssessment = useCallback(async () => {
    const traineeIds = getSelectedStudentIds();
    if (traineeIds.length === 0) {
      toast.error('Please select students to sync');
      return;
    }
    await syncPostAssessmentAsync({ traineeIds });
    clearSelection?.();
  }, [getSelectedStudentIds, syncPostAssessmentAsync, clearSelection]);

  const handleSyncEnrollTrainees = useCallback(async () => {
    const traineeIds = getSelectedStudentIds();
    if (traineeIds.length === 0) {
      toast.error('Please select students to sync');
      return;
    }
    await syncEnrollTraineesAsync({ traineeIds });
    clearSelection?.();
  }, [getSelectedStudentIds, syncEnrollTraineesAsync, clearSelection]);

  const handleSyncCreateTrainees = useCallback(async () => {
    const traineeIds = getSelectedStudentIds();
    if (traineeIds.length === 0) {
      toast.error('Please select students to sync');
      return;
    }
    await syncCreateTraineesAsync({ traineeIds });
    clearSelection?.();
  }, [getSelectedStudentIds, syncCreateTraineesAsync, clearSelection]);

  const handleSyncCompletion = useCallback(async () => {
    const traineeIds = getSelectedStudentIds();
    if (traineeIds.length === 0) {
      toast.error('Please select students to sync');
      return;
    }
    await syncCompletionAsync({ traineeIds });
    clearSelection?.();
  }, [getSelectedStudentIds, syncCompletionAsync, clearSelection]);

  // Sync handlers for all students in training
  const handleSyncPreAssessmentTraining = useCallback(() => {
    syncPreAssessmentTraining({ trainingId });
  }, [syncPreAssessmentTraining, trainingId]);

  const handleSyncPostAssessmentTraining = useCallback(() => {
    syncPostAssessmentTraining({ trainingId });
  }, [syncPostAssessmentTraining, trainingId]);

  const handleSyncEnrollTraineesTraining = useCallback(() => {
    syncEnrollTraineesTraining({ trainingId });
  }, [syncEnrollTraineesTraining, trainingId]);

  const handleSyncCreateTraineesTraining = useCallback(() => {
    syncCreateTraineesTraining({ trainingId });
  }, [syncCreateTraineesTraining, trainingId]);

  const handleSyncCompletionTraining = useCallback(() => {
    syncCompletionTraining({ trainingId });
  }, [syncCompletionTraining, trainingId]);

  return {
    // Selected students sync handlers
    handleSyncPreAssessment,
    handleSyncPostAssessment,
    handleSyncEnrollTrainees,
    handleSyncCreateTrainees,
    handleSyncCompletion,
    
    // All students sync handlers
    handleSyncPreAssessmentTraining,
    handleSyncPostAssessmentTraining,
    handleSyncEnrollTraineesTraining,
    handleSyncCreateTraineesTraining,
    handleSyncCompletionTraining,
    
    // Loading states
    isSyncingPreAssessment,
    isSyncingPostAssessment,
    isSyncingEnrollTrainees,
    isSyncingCreateTrainees,
    isSyncingCompletion,
    isSyncingPreAssessmentTraining,
    isSyncingPostAssessmentTraining,
    isSyncingEnrollTraineesTraining,
    isSyncingCreateTraineesTraining,
    isSyncingCompletionTraining,
  }
}

