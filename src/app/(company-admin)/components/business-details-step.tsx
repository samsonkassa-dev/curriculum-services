import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CompanyProfileFormData, BusinessType, IndustryType } from "@/types/company"
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form"

interface BusinessDetailsStepProps {
  register: UseFormRegister<CompanyProfileFormData>
  errors: FieldErrors<CompanyProfileFormData>
  setValue: UseFormSetValue<CompanyProfileFormData>
  watch: UseFormWatch<CompanyProfileFormData>
  businessTypes: BusinessType[]
  industryTypes: IndustryType[]
  formData: Partial<CompanyProfileFormData>
}

export function BusinessDetailsStep({ 
  register, 
  errors, 
  setValue, 
  watch,
  businessTypes,
  industryTypes,
  formData 
}: BusinessDetailsStepProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="industryType">Industry Type</Label>
          <p className="text-sm text-gray-500">Select your industry type</p>
          <Select 
            onValueChange={(value) => {
              const selected = industryTypes.find(type => type.id === value)
              if (selected) {
                setValue('industryType', selected)
              }
            }}
            value={formData.industryType?.id}
          >
            <SelectTrigger className="w-full">
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
            <p className="text-sm text-red-500">{errors.industryType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <p className="text-sm text-gray-500">Select your business type</p>
          <Select 
            onValueChange={(value) => {
              const selected = businessTypes.find(type => type.id === value)
              if (selected) {
                setValue('businessType', selected)
              }
            }}
            value={formData.businessType?.id}
          >
            <SelectTrigger className="w-full">
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
            <p className="text-sm text-red-500">{errors.businessType.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 w-[calc(50%-12px)]">
        <Label htmlFor="numberOfEmployees">Number of Employees</Label>
        <p className="text-sm text-gray-500">Select the number of employees in your company</p>
        <Select 
          onValueChange={(value) => setValue('numberOfEmployees', value as "SMALL" | "MEDIUM" | "LARGE")}
          value={formData.numberOfEmployees}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SMALL">Small</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LARGE">Large</SelectItem> 
          </SelectContent>
        </Select>
        {errors.numberOfEmployees && (
          <p className="text-sm text-red-500">{errors.numberOfEmployees.message}</p>
        )}
      </div>
    </div>
  )
} 