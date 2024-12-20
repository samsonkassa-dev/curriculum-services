import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CompanyProfileFormData } from "@/types/company"
import { UseFormRegister, FieldErrors } from "react-hook-form"

interface CompanyInfoStepProps {
  register: UseFormRegister<CompanyProfileFormData>
  errors: FieldErrors<CompanyProfileFormData>
}

export function CompanyInfoStep({ register, errors }: CompanyInfoStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          placeholder="Enter company name"
          {...register("name")}
          className="w-full"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyWebsite">
          Company Website Link <span className="text-gray-500">(Optional)</span>
        </Label>
        <Input
          id="companyWebsite"
          placeholder="Enter website URL"
          {...register("websiteUrl")}
          className="w-full"
        />
        {errors.websiteUrl && (
          <p className="text-sm text-red-500">{errors.websiteUrl.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="countryOfIncorporation">Country of Incorporation</Label>
        <Input
          id="countryOfIncorporation"
          placeholder="Select country"
          {...register("countryOfIncorporation")}
          className="w-full"
        />
        {errors.countryOfIncorporation && (
          <p className="text-sm text-red-500">{errors.countryOfIncorporation.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxIdentificationNumber">Tax Identification Number</Label>
        <Input
          id="taxIdentificationNumber"
          placeholder="Enter TIN"
          {...register("taxIdentificationNumber")}
          className="w-full"
        />
        {errors.taxIdentificationNumber && (
          <p className="text-sm text-red-500">{errors.taxIdentificationNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyAddress">Company Address</Label>
        <Input
          id="companyAddress"
          placeholder="Enter company address"
          {...register("address")}
          className="w-full"      
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <div className="flex gap-2">
          <Input
            className="w-[100px]"
            value="+251"
            disabled
          />
          <Input
            id="contactPhone"
            placeholder="9XXXXXXXX or 7XXXXXXXX"
            {...register("phone")}
            className="flex-1"
            maxLength={9}
          />
        </div>
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>
    </div>
  )
} 