"use client"

import { useState } from "react"
import { CompanyProfileForm } from "../components/company-profile-form"

export default function CompanyProfile({
  params,
}: {
  params: { companyId: string }
}) {
  const [step, setStep] = useState<'basic' | 'business' | 'additional'>('basic')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto py-12">
        <h1 className="text-xl font-semibold mb-2">
          Please fill out your Company Profile Information to Complete Your Registration Process
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Enter a brief description here to give readers an overview of the content form below.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -translate-y-1/2" />
          <div className="relative flex justify-between w-full">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 
              ${step === 'basic' ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-300'}`}>
              {step === 'basic' ? '1' : '✓'}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 
              ${step === 'business' ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-300'}`}>
              {step === 'business' || step === 'additional' ? '✓' : '2'}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 
              ${step === 'additional' ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-300'}`}>
              3
            </div>
          </div>
        </div>

        <CompanyProfileForm 
          step={step} 
          onStepChange={setStep}
          companyId={params.companyId}
        />
      </div>
    </div>
  )
} 