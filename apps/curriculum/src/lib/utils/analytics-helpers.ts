import { TrainingAnalytics } from "@/lib/hooks/useAnalytics";

/**
 * Calculate total trainees across all trainings
 */
export function getTotalTraineeCount(data: TrainingAnalytics[]) {
  return data.reduce((total, training) => total + training.totalTraineeCount, 0);
}

/**
 * Calculate total completed trainees across all trainings
 */
export function getTotalCompletedTraineeCount(data: TrainingAnalytics[]) {
  return data.reduce((total, training) => total + training.completedTraineeCount, 0);
}

/**
 * Calculate completion percentage
 */
export function getCompletionPercentage(data: TrainingAnalytics[]) {
  const total = getTotalTraineeCount(data);
  const completed = getTotalCompletedTraineeCount(data);
  
  if (total === 0) return 0;
  
  return Math.round((completed / total) * 100);
}

/**
 * Calculate gender distribution percentages
 */
export function getGenderDistribution(data: TrainingAnalytics[]) {
  // Aggregate gender counts
  const genderCounts = data.reduce((acc, training) => {
    Object.entries(training.genderRangeCount).forEach(([gender, count]) => {
      if (!acc[gender]) {
        acc[gender] = 0;
      }
      acc[gender] += count;
    });
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate total
  const total = Object.values(genderCounts).reduce((sum, count) => sum + count, 0);
  
  // Calculate percentages
  if (total === 0) return {};
  
  return Object.entries(genderCounts).reduce((acc, [gender, count]) => {
    acc[gender] = Math.round((count / total) * 100);
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get the top trainings by trainee count
 */
export function getTopTrainings(data: TrainingAnalytics[], limit = 5) {
  return [...data]
    .sort((a, b) => b.totalTraineeCount - a.totalTraineeCount)
    .slice(0, limit);
}

/**
 * Get active trainings (with at least one trainee)
 */
export function getActiveTrainings(data: TrainingAnalytics[]) {
  return data.filter(training => training.totalTraineeCount > 0);
} 