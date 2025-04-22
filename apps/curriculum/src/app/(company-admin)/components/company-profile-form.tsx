/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCompanyProfile } from "@/lib/hooks/useCompanyProfile";
import { useState, useEffect } from "react";
import { CompanyProfileFormData } from "@/types/company";

import {
  companyInformationSchema,
  businessDetailsSchema,
  additionalInformationSchema,
} from "@/types/company-profile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBusinessTypes } from "@/lib/hooks/useBusinessTypes";
import { useCompanyFileTypes } from "@/lib/hooks/useCompanyFileTypes";
import axios from "axios";
import { CompanyInfoStep } from "./company-info-step";
import { BusinessDetailsStep } from "./business-details-step";
import { AdditionalInfoStep } from "./additional-info-step";
import { setCookie } from "@curriculum-services/auth";

interface CompanyProfileFormProps {
  step: "companyInfo" | "businessDetail" | "additionalInfo";
  onStepChange: (
    step: "companyInfo" | "businessDetail" | "additionalInfo"
  ) => void;
}

export function CompanyProfileForm({
  step,
  onStepChange,
}: CompanyProfileFormProps) {
  const { mutateAsync: createCompanyProfile, isPending: isCreating } = useCreateCompanyProfile();
  const [formData, setFormData] = useState<Partial<CompanyProfileFormData>>({});
  const router = useRouter();
  const {
    businessTypes,
    industryTypes,
    isLoading: isLoadingTypes,
  } = useBusinessTypes();
  const { fileTypes } = useCompanyFileTypes();

  const getStepSchema = () => {
    switch (step) {
      case "companyInfo":
        return companyInformationSchema;
      case "businessDetail":
        return businessDetailsSchema;
      case "additionalInfo":
        return additionalInformationSchema;
      default:
        return companyInformationSchema;
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    getValues,
  } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(getStepSchema()),
    defaultValues: formData,
    mode: "onSubmit",
  });

  // Update formData when values change
  useEffect(() => {
    const subscription = watch((value: any) => {
      setFormData((prev) => ({
        ...prev,
        ...(value as Partial<CompanyProfileFormData>),
      }));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async () => {
    const currentValues = getValues();
    setFormData((prev) => ({ ...prev, ...currentValues }));

    if (step === "additionalInfo") {
      // Check if business details are complete
      if (
        !formData.businessType?.id ||
        !formData.industryType?.id ||
        !formData.numberOfEmployees
      ) {
        toast.error("Validation Error", {
          description:
            "Please complete all required fields in the Business Details step",
        });
        return;
      }

      try {
        // Cast formData to CompanyProfileFormData since we've validated required fields
        const response = await createCompanyProfile(formData as CompanyProfileFormData);
        const { id, verificationStatus } = response.companyProfile;

        // Save as cookie instead of localStorage
        setCookie("company_info", JSON.stringify({ id, verificationStatus }), 30); // 30 days

        toast.success("Company profile created successfully", {
          description: "You will be redirected to the dashboard",
        });

        setTimeout(() => router.push(`/${id}/dashboard`), 1000);
      } catch (error) {
        // Handle API errors
        if (axios.isAxiosError(error)) {
          toast.error("API Error", {
            description:
              error.response?.data?.message ||
              "Failed to create company profile",
          });
        } else {
          toast.error("Error", {
            description: "An unexpected error occurred",
          });
        }
      }
    } else if (step === "companyInfo") {
      onStepChange("businessDetail");
    } else if (step === "businessDetail") {
      onStepChange("additionalInfo");
    }
  };

  // Update form when going back
  const handleBack = () => {
    const currentValues = getValues();
    setFormData((prev) => ({ ...prev, ...currentValues }));
    onStepChange(step === "businessDetail" ? "companyInfo" : "businessDetail");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {step === "companyInfo" && (
        <CompanyInfoStep register={register} errors={errors} setValue={setValue} watch={watch} />
      )}

      {step === "businessDetail" && (
        <BusinessDetailsStep
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          businessTypes={businessTypes}
          industryTypes={industryTypes}
          formData={formData}
        />
      )}

      {step === "additionalInfo" && (
        <AdditionalInfoStep
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          fileTypes={fileTypes}
        />
      )}

      {/* Buttons section */}
      <div
        className={`${
          step === "companyInfo"
            ? "flex justify-center"
            : "flex justify-center gap-14"
        } py-10`}
      >
        {step !== "companyInfo" && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="w-[120px] border-[#0066FF] text-[#0066FF]"
          >
            Back
          </Button>
        )}

        <Button
          type="submit"
          disabled={step === "additionalInfo" && isCreating}
          className={`px-9 py-5 font-semibold ${
            step === "additionalInfo"
              ? "bg-[#0B75FF] hover:bg-[#0052CC]"
              : "bg-[#0B75FF] hover:bg-[#0052CC]"
          } text-white`}
        >
          {step === "additionalInfo"
            ? isCreating
              ? "Submitting..."
              : "Send Request"
            : "Continue"}
        </Button>
      </div>
    </form>
  );
}
