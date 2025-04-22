'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  fileTypes,
}: AdditionalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="accreditation">Accreditation</Label>
        <Input
          id="accreditation"
          placeholder="Enter company accreditation"
          {...register("accreditation")}
          className="w-full"
        />
        {errors.accreditation && (
          <p className="text-sm text-red-500">{errors.accreditation.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="license">License</Label>
        <Input
          id="license"
          placeholder="Enter company license"
          {...register("license")}
          className="w-full"
        />
        {errors.license && (
          <p className="text-sm text-red-500">{errors.license.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherDescription">
          Other Description <span className="text-gray-500">(Optional)</span>
        </Label>
        <Input
          id="otherDescription"
          placeholder="Enter other description"
          {...register("otherDescription")}
          className="w-full"
        />
        {errors.otherDescription && (
          <p className="text-sm text-red-500">{errors.otherDescription.message}</p>
        )}
      </div>

      <FileUploadSection
        fileTypes={fileTypes}
        setValue={setValue}
        watch={watch}
      />
    </div>
  )
} 