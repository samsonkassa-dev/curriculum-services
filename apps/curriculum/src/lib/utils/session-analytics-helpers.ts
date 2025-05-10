import { SessionAnalytics } from "@/lib/hooks/useAnalytics";

/**
 * Calculate total sessions across all trainings
 */
export function getTotalSessionCount(data: SessionAnalytics[]) {
  return data.reduce((total, training) => total + training.totalSessionCount, 0);
}

/**
 * Calculate total active sessions across all trainings
 */
export function getActiveSessionCount(data: SessionAnalytics[]) {
  return data.reduce((total, training) => total + training.activeSessionCount, 0);
}

/**
 * Calculate total completed sessions across all trainings
 */
export function getCompletedSessionCount(data: SessionAnalytics[]) {
  return data.reduce((total, training) => total + training.completedSessionCount, 0);
}

/**
 * Calculate total cancelled sessions across all trainings
 */
export function getCancelledSessionCount(data: SessionAnalytics[]) {
  return data.reduce((total, training) => total + training.cancelledSessionCount, 0);
}

/**
 * Calculate delivery method counts across all trainings
 */
export function getDeliveryMethodCounts(data: SessionAnalytics[]) {
  return data.reduce((acc, training) => {
    const { deliveryMethodCount } = training;
    
    // Add the delivery method counts to our accumulator
    Object.entries(deliveryMethodCount).forEach(([method, count]) => {
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += count;
    });
    
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get trainings with active sessions
 */
export function getTrainingsWithActiveSessions(data: SessionAnalytics[]) {
  return data.filter(training => training.activeSessionCount > 0);
}

/**
 * Calculate session completion percentage
 */
export function getSessionCompletionPercentage(data: SessionAnalytics[]) {
  const total = getTotalSessionCount(data);
  const completed = getCompletedSessionCount(data);
  
  if (total === 0) return 0;
  
  return Math.round((completed / total) * 100);
} 