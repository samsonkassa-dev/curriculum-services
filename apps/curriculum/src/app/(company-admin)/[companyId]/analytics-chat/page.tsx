"use client";

import { useRouter } from "next/navigation";
import { AnalyticsChatView } from "@/components/dashboard/analytics-chat-view";

export default function AnalyticsChatPage() {
  const router = useRouter();

  // Handle the back navigation
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnalyticsChatView onBack={handleBack} />
    </div>
  );
} 