import { StatsCard } from "./stats-card";
import { GenderDistributionChart } from "./gender-distribution-chart";
import { AgeDistributionChart } from "./age-distribution-chart";
import { TrainingCompletionChart } from "./training-completion-chart";
import { DeliveryMethodChart } from "./delivery-method-chart";
import { SessionStatusChart } from "./session-status-chart";
import { SessionMetricsChart } from "./session-metrics-chart";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { 
  getActiveTrainings,
  getCompletionPercentage, 
  getTotalCompletedTraineeCount, 
  getTotalTraineeCount,
  getGenderDistribution
} from "@/lib/utils/analytics-helpers";
import {
  getActiveSessionCount,
  getCompletedSessionCount,
  getTotalSessionCount,
  getTrainingsWithActiveSessions,
  getSessionCompletionPercentage
} from "@/lib/utils/session-analytics-helpers";
import { 
  Users, 
  Award, 
  Briefcase, 
  Blocks,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { ChatButton } from "./chat-button";

export function AnalyticsDashboard() {
  const { data, isLoading, error } = useAnalytics();
  const router = useRouter();
  const params = useParams();
  const companyId = params?.companyId as string;
  
  // Handle navigation to chat page
  const handleNavigateToChat = () => {
    router.push(`/${companyId}/analytics-chat`);
  };
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }
  
  // Handle error state
  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 my-4">
        <p className="font-medium">Failed to load analytics data</p>
        <p className="text-sm">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
      </div>
    );
  }
  
  // Trainee analytics
  const traineeCount = getTotalTraineeCount(data.traineeCountPerTraining);
  const completedCount = getTotalCompletedTraineeCount(
    data.traineeCountPerTraining
  );
  const completionPercentage = getCompletionPercentage(
    data.traineeCountPerTraining
  );
  const activeTrainings = getActiveTrainings(
    data.traineeCountPerTraining
  ).length;
  const genderDistribution = getGenderDistribution(
    data.traineeCountPerTraining
  );
  
  // Session analytics
  const totalSessions = getTotalSessionCount(data.sessionCountPerTraining);
  const activeSessions = getActiveSessionCount(data.sessionCountPerTraining);
  const completedSessions = getCompletedSessionCount(
    data.sessionCountPerTraining
  );
  
  // Most common gender (for fourth trainee card)
  const findMostCommonGender = () => {
    if (!genderDistribution || Object.keys(genderDistribution).length === 0) {
      return { gender: "N/A", percentage: 0 };
    }
    
    const topGender = Object.entries(genderDistribution).sort(
      ([, countA], [, countB]) => countB - countA
    )[0];
    
    return {
      gender: topGender[0],
      percentage: topGender[1],
    };
  };
  
  const mostCommonGender = findMostCommonGender();
  
  // Session metrics data for the new pie chart
  const sessionMetricsData = [
    { name: "Total", value: totalSessions, color: "#0B75FF" },
    { name: "Active", value: activeSessions, color: "#8EEDF7" },
    { name: "Completed", value: completedSessions, color: "#FF9066" },
  ];
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        {/* Unified Analytics Dashboard */}
        <div>
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-md bg-emerald-100 mr-3">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold">Impact Analytics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard 
              title="Total Trainees"
              value={traineeCount.toString()}
              icon={<Users className="h-6 w-6 text-blue-600" />}
              className=""
            />
            <StatsCard 
              title="Completed Trainees"
              value={completedCount.toString()}
              description={`${completionPercentage}% completion rate`}
              icon={<Award className="h-6 w-6 text-green-600" />}
              className="bg-white"
            />
            <StatsCard 
              title="Active Trainings"
              value={activeTrainings.toString()}
              description={`With registered trainees`}
              icon={<Briefcase className="h-6 w-6 text-orange-600" />}
              className="bg-white"
            />
            <StatsCard 
              title={`Most Common Gender`}
              value={mostCommonGender.gender}
              description={`${mostCommonGender.percentage}% of trainees`}
              icon={<Blocks className="h-6 w-6 text-purple-600" />}
              className="bg-white"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <TrainingCompletionChart
              data={data.traineeCountPerTraining}
              className="bg-white"
            />
            <GenderDistributionChart
              data={data.traineeCountPerTraining}
              className="bg-white"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <SessionStatusChart
              data={data.sessionCountPerTraining}
              className="bg-white"
            />
            <DeliveryMethodChart
              data={data.sessionCountPerTraining}
              className="bg-white"
              title="Training Delivery Methods"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <AgeDistributionChart
              data={data.traineeCountPerTraining}
              className="bg-white"
            />
            <SessionMetricsChart
              data={sessionMetricsData}
              className="bg-white"
              title="Session Metrics"
            />
          </div>
        </div>
      </div>
      
      {/* Chat button that navigates to the chat route */}
      <ChatButton onClick={handleNavigateToChat} />
    </div>
  );
} 