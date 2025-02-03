"use client";

import { useState } from "react";
import { useTrainingProfile } from "@/lib/hooks/useTrainingProfile";
import { DefaultCreate } from "./defaultCreate";
import { TrainingProfileEdit } from "./training-profile/training-profile-edit";
import { TrainingProfileView } from "./training-profile/training-profile-view";
import { Loading } from "@/components/ui/loading";

interface TrainingProfileProps {
  trainingId: string;
}

export function TrainingProfile({ trainingId }: TrainingProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: trainingProfile, isLoading } = useTrainingProfile(trainingId);
  const userRole = localStorage.getItem("user_role");
  const canEdit = userRole === "ROLE_COMPANY_ADMIN" || userRole === "ROLE_CURRICULUM_ADMIN";

  const isEmptyProfile = !trainingProfile || (
    trainingProfile.keywords.length === 0 &&
    !trainingProfile.scope &&
    !trainingProfile.rationale &&
    !trainingProfile.alignmentsWithStandard &&
    !trainingProfile.executiveSummary
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isEditing && canEdit) {
    return (
      <TrainingProfileEdit
        trainingId={trainingId}
        initialData={trainingProfile || null}
        onSave={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (isEmptyProfile && canEdit) {
    return (
      <DefaultCreate 
        title="Create Training Profile"
        trainingId={trainingId}
        onCreateClick={() => setIsEditing(true)}
      />
    );
  }

  if (isEmptyProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No training profile available yet.</p>
      </div>
    );
  }

  return (
    <TrainingProfileView 
      trainingProfile={trainingProfile}
      onEdit={() => setIsEditing(true)}
    />
  );
}
