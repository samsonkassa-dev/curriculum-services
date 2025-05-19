/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CreateTrainingStep1,
  CreateTrainingStep2,
  CreateTrainingStep3,
  CreateTrainingStep4,
  CreateTrainingStep5,
} from "./components/create-training-forms";
import { useCreateTraining } from "@/lib/hooks/useCreateTraining";
import { SuccessModal } from "./components/modals/success-modal";
import { InviteModal } from "./components/modals/invite-modal";
import { useInviteTrainingUser, RoleType } from "@/lib/hooks/useInviteTrainingUser";

type Step = 1 | 2 | 3 | 4 | 5;

export default function CreateTraining() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<any>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [trainingId, setTrainingId] = useState<string>();
  const router = useRouter();
  const params = useParams();
  const { createTraining, isLoading } = useCreateTraining();
  const { inviteUser, isLoading: isInviting } = useInviteTrainingUser();

  const handleNext = (stepData: any) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    if (currentStep === 5) {
      createTraining(updatedData, {
        onSuccess: (response) => {
          setTrainingId(response.training.id);
          setShowSuccessModal(true);
        },
      });
    } else {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleAssignClick = () => {
    setShowSuccessModal(false);
    setShowInviteModal(true);
  };

  const handleInvite = async (email: string) => {
    if (!trainingId) return;

    inviteUser(trainingId, email, RoleType.CURRICULUM_ADMIN, () => {
      router.push(`/${params.companyId}/training`);
    });
  };

  const handleInviteModalClose = () => {
    setShowInviteModal(false);
    router.push(`/${params.companyId}/training`);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleExit = () => {
    router.back();
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push(`/${params.companyId}/training`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CreateTrainingStep1 onNext={handleNext} initialData={formData} />;
      case 2:
        return <CreateTrainingStep2 onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 3:
        return <CreateTrainingStep3 onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 4:
        return <CreateTrainingStep4 onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 5:
        return (
          <CreateTrainingStep5
            onNext={handleNext}
            onBack={handleBack}
            isSubmitting={isLoading}
            initialData={formData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#FBFBFB]">
        <div className="w-full mx-auto py-8 ">
          {/* Progress Header */}
          <div className="flex justify-between items-center mb-8 px-10">
            <div className="text-sm text-gray-500">Step {currentStep} of 5</div>
            <button
              onClick={handleExit}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Exit
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-[3px] mb-12">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          {/* Form Steps */}
          <div className="w-full mx-auto px-5">{renderStep()}</div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onAssignClick={handleAssignClick}
      />

      <InviteModal
        isOpen={showInviteModal}
        onClose={handleInviteModalClose}
        onInvite={handleInvite}
        isLoading={isInviting}
      />
    </>
  );
}

  