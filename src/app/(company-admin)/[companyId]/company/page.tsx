"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyProfileSchema,
  CompanyProfileFormSchema,
} from "@/types/company-profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCompanyProfile } from "@/lib/hooks/useCompanyProfile";
import { useParams, useRouter } from "next/navigation";
import { useMyCompanyProfile } from "@/lib/hooks/useFetchCompanyProfiles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessTypes } from "@/lib/hooks/useBusinessTypes";
import { toast } from "sonner";

const Company = () => {
  const router = useRouter();
  const { companyId } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyProfileFormSchema>({
    resolver: zodResolver(companyProfileSchema),
  });

  const {
    data: company,
    isLoading: isFetchingCompanyProfile,
    isError: isFetchingError,
  } = useMyCompanyProfile({ enabled: true });

  const { updateCompanyProfile, isLoading: isUpdatingCompanyProfile } =
    useCompanyProfile();

  useEffect(() => {
    console.log("Company data: ", company); // Debugging step
    if (!isFetchingCompanyProfile && company) {
      const mapNumberOfEmployees = (employeeSize: string | undefined) => {
        if (employeeSize === undefined) return undefined; // Handle missing data
        if (employeeSize.includes("MICRO")) return "MICRO";
        if (employeeSize.includes("SMALL")) return "SMALL";
        if (employeeSize.includes("MEDIUM")) return "MEDIUM";
        return "LARGE"; // 250 or more
      };

      const numberOfEmployees = mapNumberOfEmployees(company.numberOfEmployees);

      reset({
        name: company.name || "",
        phone: company.phone.slice(4) || "",
        address: company.address || "",
        websiteUrl: company.websiteUrl || "",
        countryOfIncorporation: company.countryOfIncorporation || "",
        taxIdentificationNumber: company.taxIdentificationNumber || "",
        industryType: company.industryType || undefined,
        businessType: company.businessType || undefined,
        numberOfEmployees,
        otherDescription: company.otherDescription || "",
      });
    }
  }, [isFetchingCompanyProfile, company, reset]);

  const onSubmit = (data: CompanyProfileFormSchema) => {
    console.log(data);

    const modifiedData = {
      ...data,
    };
    updateCompanyProfile(
      { id: companyId as string, data: modifiedData },
      {
        onSuccess: () => {
          toast.success("Company profile updated successfully");
          router.push(`/`);
        },
      }
    );
  };
  const onBack = () => {
    router.push(`/`);
  };

  const { businessTypes, industryTypes } = useBusinessTypes();

  return (
    <div className="max-w-screen-2xl mx-auto max-2xl:mx-6 max-md:mx-2 lg:mt-12 mt-6 flex flex-col gap-4">
      <div className=" bg-[#FBFBFB] rounded-xl xl:p-5 p-2">
        <div className="lg:flex lg:justify-center">
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            className="flex flex-col lg:grid lg:grid-cols-2 xl:gap-x-20 lg:gap-y-8 gap-y-6 gap-x-4 lg:w-4/5 py-5 items-start"
          >
            <div className="col-span-2 w-full">
              <p className="font-semibold text-xl">Company Profile</p>
              <p className="text-[#9C9791] text-sm">
                Please enter all relevant attributes of your company
              </p>
            </div>
            <div className="space-y-2 w-full pt-1">
              <Label htmlFor="companyName">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Company Name
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  Please enter the name of the company
                </p>
              </Label>
              <Input
                id="companyName"
                placeholder=""
                {...register("name")}
                className="w-full"
                isError={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2 w-full pt-1">
              <Label htmlFor="contactPhone">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Contact Phone
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  Please enter the phone number
                </p>
              </Label>
              <div className="flex gap-2">
                <Input className="w-[100px]" value="+251" disabled />
                <div className="w-full">
                  <Input
                    id="contactPhone"
                    placeholder="9XXXXXXXX or 7XXXXXXXX"
                    {...register("phone")}
                    className="flex-1"
                    maxLength={9}
                    isError={!!errors.phone}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2 w-full pt-1">
              <Label htmlFor="countryOfIncorporation">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Country of Incorporation
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  Please select the country where the company is incorporated
                </p>
              </Label>
              <Input
                id="countryOfIncorporation"
                placeholder=""
                {...register("countryOfIncorporation")}
                className="w-full"
                isError={!!errors.countryOfIncorporation}
              />
              {errors.countryOfIncorporation && (
                <p className="text-sm text-red-500">
                  {errors.countryOfIncorporation.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full pt-1">
              <Label htmlFor="taxIdentificationNumber">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Tax Identification Number
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  Please enter the TIN (10 digits)
                </p>
              </Label>
              <Input
                id="taxIdentificationNumber"
                placeholder=""
                {...register("taxIdentificationNumber")}
                className="w-full"
                isError={!!errors.taxIdentificationNumber}
                maxLength={10}
                minLength={10}
              />
              {errors.taxIdentificationNumber && (
                <p className="text-sm text-red-500">
                  {errors.taxIdentificationNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full pt-1">
              <Label htmlFor="companyAddress">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Company Address
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  Please enter the company&apos;s address
                </p>
              </Label>
              <Input
                id="companyAddress"
                placeholder=""
                {...register("address")}
                className="w-full"
                isError={!!errors.address}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2 w-full pt-1">
              <Label htmlFor="companyWebsite">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Company Website Link
                  <span className="text-brand text-sm font-light">
                    &nbsp;(optional)
                  </span>
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  Please enter the website URL
                </p>
              </Label>
              <Input
                id="companyWebsite"
                placeholder=""
                {...register("websiteUrl")}
                className="w-full"
                isError={!!errors.websiteUrl}
              />
              {errors.websiteUrl && (
                <p className="text-sm text-red-500">
                  {errors.websiteUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full pt-1">
              <Label htmlFor="industryType">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Industry Type
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  Please select your industry type
                </p>
              </Label>
              <Select
                onValueChange={(value) => {
                  const selected = industryTypes.find(
                    (type) => type.id === value
                  );
                  if (selected) {
                    setValue("industryType", selected);
                  }
                }}
                value={watch("industryType")?.id}
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {industryTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industryType && (
                <p className="text-sm text-red-500">
                  {errors.industryType.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full pt-1">
              <Label htmlFor="businessType">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Business Type
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  Please select your business type
                </p>
              </Label>
              <Select
                onValueChange={(value) => {
                  const selected = businessTypes.find(
                    (type) => type.id === value
                  );
                  if (selected) {
                    setValue("businessType", selected);
                  }
                }}
                value={watch("businessType")?.id}
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="text-sm text-red-500">
                  {errors.businessType.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full pt-1">
              <Label htmlFor="employeeCount">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Number of Employees
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  Select the number of employees in your company
                </p>
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "numberOfEmployees",
                    value as "SMALL" | "MEDIUM" | "LARGE"
                  )
                }
                value={watch("numberOfEmployees")}
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MICRO">Micro</SelectItem>
                  <SelectItem value="SMALL">Small</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LARGE">Large</SelectItem>
                </SelectContent>
              </Select>
              {errors.numberOfEmployees && (
                <p className="text-sm text-red-500">
                  {errors.numberOfEmployees.message}
                </p>
              )}
            </div>
            <div className="space-y-2 col-span-2 w-full pt-1">
              <Label htmlFor="employeeCount">
                <p className="text-[1rem] font-semibold pb-[2px]">
                  Other Description
                </p>
                <p className="text-[#9C9791] text-sm font-light">
                  please enter any other description about your company
                </p>
              </Label>
              <textarea
                id="otherDescription"
                placeholder="Enter description"
                {...register("otherDescription")}
                className="w-full min-h-[100px] p-2 border rounded-md"
              />
              {errors.otherDescription && (
                <p className="text-sm text-red-500">
                  {errors.otherDescription.message}
                </p>
              )}
            </div>

            <div className="space-x-10 lg:mt-10 mt-2 col-span-2 w-full flex justify-center">
              <Button
                variant="secondary"
                size="default"
                className={cn(
                  `w-40 h-10 px-4 py-3 rounded-sm font-medium border border-[#9C9791] lg:mr-20 md:mr-10`
                )}
                type="reset"
                onClick={() => onBack()}
              >
                Back
              </Button>
              <Button
                variant="default"
                size="default"
                disabled={
                  isFetchingCompanyProfile ||
                  isUpdatingCompanyProfile ||
                  isFetchingError
                }
                type="submit"
                className={cn(
                  `w-40 h-10 px-4 py-3 rounded-sm font-medium text-white disabled:opacity-50`
                )}
              >
                {isUpdatingCompanyProfile ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Company;
