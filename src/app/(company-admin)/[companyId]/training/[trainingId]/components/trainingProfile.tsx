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

  if (isEditing) {
    return (
      <TrainingProfileEdit
        trainingId={trainingId}
        initialData={trainingProfile || null}
        onSave={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (isEmptyProfile) {
    return (
      <DefaultCreate 
        title="Create Training Profile"
        trainingId={trainingId}
        onCreateClick={() => setIsEditing(true)}
      />
    );
  }

  return (
    <TrainingProfileView 
      trainingProfile={trainingProfile}
      onEdit={() => setIsEditing(true)}
    />
  );
}
