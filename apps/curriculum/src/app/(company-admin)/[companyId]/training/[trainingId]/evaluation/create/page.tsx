"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function CreateEvaluation() {
  const router = useRouter()
  const params = useParams()
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleExit = () => {
    router.back()
  }

  const handleBack = () => {
    router.back()
  }

  const handleContinue = () => {
    if (!selectedType) return
    
    // Navigate to the main evaluation page to create new evaluation
    router.push(`/${params.companyId}/training/${params.trainingId}/evaluation`)
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <div className="w-full mx-auto py-8">
        {/* Top Nav Bar */}
        <div className="flex justify-end items-center px-16 mb-8">
          <button
            onClick={handleExit}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Exit
          </button>
        </div>
        
        {/* Blue progress indicator */}
        <div className="w-full h-[2px] bg-brand mb-12" />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-8">
          {/* Form */}
          <div className="flex flex-col items-center mb-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-medium text-gray-900 mb-2">What type of M&E form do you want to create?</h1>
              <p className="text-gray-500">Enter a brief description about this question here</p>
            </div>

            {/* Option Cards */}
            <div className="flex flex-row gap-6 w-full justify-center">
              {/* Pre-Training Card */}
              <div 
                className={`border rounded-md p-6 w-[400px] h-[140px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 ${selectedType === 'pre' ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                onClick={() => setSelectedType('pre')}
              >
                <h3 className="text-xl font-normal text-black mb-2">Pre Training</h3>
                <p className="text-sm text-gray-500 text-center">Enter brief description about this question here</p>
              </div>

              {/* Mid-Training Card */}
              <div 
                className={`border rounded-md p-6 w-[400px] h-[140px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 ${selectedType === 'mid' ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                onClick={() => setSelectedType('mid')}
              >
                <h3 className="text-xl font-normal text-black mb-2">Mid Training</h3>
                <p className="text-sm text-gray-500 text-center">Enter brief description about this question here</p>
              </div>

              {/* Post-Training Card */}
              <div 
                className={`border rounded-md p-6 w-[400px] h-[140px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 ${selectedType === 'post' ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                onClick={() => setSelectedType('post')}
              >
                <h3 className="text-xl font-normal text-black mb-2">Post Training</h3>
                <p className="text-sm text-gray-500 text-center">Enter brief description about this question here</p>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-between w-full max-w-xl mx-auto">
            <Button
              variant="outline"
              className="px-8 py-3 border-gray-400 text-gray-500"
              onClick={handleBack}
            >
              Back
            </Button>

            <Button
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleContinue}
              disabled={!selectedType}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 