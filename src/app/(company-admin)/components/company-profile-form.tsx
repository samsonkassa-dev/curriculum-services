"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companyProfileSchema } from "@/types/company-profile"
import { useCompanyProfile } from "@/hooks/useCompanyProfile"
import { useState } from "react"
import { CompanyProfileFormData } from "@/types/company"

interface CompanyProfileFormProps {
  step: 'basic' | 'business' | 'additional'
  onStepChange: (step: 'basic' | 'business' | 'additional') => void
}

export function CompanyProfileForm({ step, onStepChange }: CompanyProfileFormProps) {
  const { submitCompanyProfile, isLoading, error } = useCompanyProfile()
  const [formData, setFormData] = useState<Partial<CompanyProfileFormData>>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: formData,
  })

  const onSubmit = async (data: CompanyProfileFormData) => {
    setFormData(prev => ({ ...prev, ...data }))
    
    if (step === 'basic') {
      onStepChange('business')
    } else if (step === 'business') {
      onStepChange('additional')
    } else {
      try {
        await submitCompanyProfile(data)
        // Handle success (e.g., show success message, redirect, etc.)
      } catch (error) {
        console.error('Error submitting company profile:', error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {step === 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Enter company name"
              {...register("companyName")}
              className="w-full"
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite">
              Company Website Link <span className="text-gray-500">(Optional)</span>
            </Label>
            <Input
              id="companyWebsite"
              placeholder="Enter website URL"
              {...register("companyWebsite")}
              className="w-full"
            />
            {errors.companyWebsite && (
              <p className="text-sm text-red-500">{errors.companyWebsite.message}</p>
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
              {...register("companyAddress")}
              className="w-full"
            />
            {errors.companyAddress && (
              <p className="text-sm text-red-500">{errors.companyAddress.message}</p>
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
                placeholder="Enter phone number"
                {...register("contactPhone")}
                className="flex-1"
              />
            </div>
            {errors.contactPhone && (
              <p className="text-sm text-red-500">{errors.contactPhone.message}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-center">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-[120px] text-white"
            >
              {isLoading ? "Loading..." : "Continue"}
            </Button>
          </div>
        </div>
      )}

      {step !== 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Enter company name"
              {...register("companyName")}
              className="w-full"
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite">
              Company Website Link <span className="text-gray-500">(Optional)</span>
            </Label>
            <Input
              id="companyWebsite"
              placeholder="Enter website URL"
              {...register("companyWebsite")}
              className="w-full"
            />
            {errors.companyWebsite && (
              <p className="text-sm text-red-500">{errors.companyWebsite.message}</p>
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
              {...register("companyAddress")}
              className="w-full"
            />
            {errors.companyAddress && (
              <p className="text-sm text-red-500">{errors.companyAddress.message}</p>
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
                placeholder="Enter phone number"
                {...register("contactPhone")}
                className="flex-1"
              />
            </div>
            {errors.contactPhone && (
              <p className="text-sm text-red-500">{errors.contactPhone.message}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={() => onStepChange(step === 'additional' ? 'business' : 'basic')}
              className="w-[120px]"
            >
              Back
            </Button>
            <Button 
              variant="default"
              type="submit" 
              disabled={isLoading}
              className="w-[120px]"
            >
              {step === 'additional' ? (isLoading ? "Submitting..." : "Submit") : "Continue"}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
} 