'use client'

import { Label } from "@/components/ui/label"
import { CompanyProfileFormData, CompanyFileType } from "@/types/company"
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { FileUploadSection } from "@/components/file-upload/file-upload-section"

interface AdditionalInfoStepProps {
  register: UseFormRegister<CompanyProfileFormData>
  errors: FieldErrors<CompanyProfileFormData>
  setValue: UseFormSetValue<CompanyProfileFormData>
  watch: UseFormWatch<CompanyProfileFormData>
  fileTypes: CompanyFileType[]
}

export function AdditionalInfoStep({
  register,
  errors,
  setValue,
  watch,
  fileTypes
}: AdditionalInfoStepProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-2">
        <FileUploadSection 
          setValue={setValue}
          watch={watch}
          fileTypes={fileTypes}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherDescription">Other Description</Label>
        <p className="text-sm text-gray-500">Please write a description about this section</p>
        <textarea
          id="otherDescription"
          placeholder="Enter description"
          {...register("otherDescription")}
          className="w-full min-h-[100px] p-2 border rounded-md"
        />
        {errors.otherDescription && (
          <p className="text-sm text-red-500">{errors.otherDescription.message}</p>
        )}
      </div>
    </div>
  )
} 