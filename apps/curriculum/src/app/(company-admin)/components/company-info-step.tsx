import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { CompanyProfileFormData } from "@/types/company"
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CompanyInfoStepProps {
  register: UseFormRegister<CompanyProfileFormData>
  errors: FieldErrors<CompanyProfileFormData>
  setValue: UseFormSetValue<CompanyProfileFormData>
  watch: UseFormWatch<CompanyProfileFormData>
}

export function CompanyInfoStep({ register, errors, setValue, watch }: CompanyInfoStepProps) {
  // Handle phone number changes
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 9) {
      // Store without prefix - it will be added during submission
      setValue('phone', numbers);
    }
  };

  // Handle TIN changes
  const handleTINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 10) {
      setValue('taxIdentificationNumber', numbers);
    }
  };

  const { data: countries, isLoading: isLoadingCountries } = useBaseData('country')

  // Add handler for country selection
  const handleCountryChange = (value: string) => {
    setValue('countryOfIncorporation', value)
  }

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
        <Select 
          onValueChange={handleCountryChange}
          value={watch('countryOfIncorporation')}
        >
          <SelectTrigger className="w-full py-[24px]">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries?.map((country: { id: string; name: string }) => (
              <SelectItem 
                key={country.id} 
                value={country.name}
              >
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.countryOfIncorporation && (
          <p className="text-sm text-red-500">{errors.countryOfIncorporation.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxIdentificationNumber">Tax Identification Number</Label>
        <Input
          id="taxIdentificationNumber"
          placeholder="Enter TIN (10 digits)"
          value={watch('taxIdentificationNumber') || ''}
          onChange={handleTINChange}
          maxLength={10}
          minLength={10}
          className="w-full"
        />
        {errors.taxIdentificationNumber && (
          <p className="text-sm text-red-500">{errors.taxIdentificationNumber.message}</p>
        )}
        {watch('taxIdentificationNumber') && watch('taxIdentificationNumber').length !== 10 && (
          <p className="text-sm text-red-500">TIN must be exactly 10 digits</p>
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
            value={watch('phone') || ''}
            onChange={handlePhoneChange}
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