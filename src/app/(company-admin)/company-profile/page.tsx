"use client"

import { useState } from "react"
import { CompanyProfileForm } from "../components/company-profile-form"

export default function CompanyProfile() {
  const [step, setStep] = useState<"basic" | "business" | "additional">(
    "basic"
  );

  return (
    <div className="w-full px-4 md:px-6 py-12 md:py-24">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-lg md:text-xl font-semibold mb-2">
          Please fill out your Company Profile Information to Complete Your
          Registration Process
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Enter a brief description here to give readers an overview of the
          content form below.
        </p>
        <div className="bg-[#FBFBFB]">
          <div className="p-4 md:p-10 rounded-lg max-w-[850px] mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-12">
              {/* Stepper Container */}
              <div className="relative w-full">
                {/* Background gray line - now starts after first circle and ends before last circle */}
                <div className="absolute top-[17px] left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-[2px] bg-gray-200" />

                <div className="relative flex justify-between">
                  {/* First progress line - adjusted to start after first circle */}
                  <div
                    className={`absolute  top-[17px] left-[calc(16.67%+16px)] h-[2px] -translate-y-1/2 transition-all duration-300
                ${
                  step === "basic" ? "w-0 " : "bg-green-500 w-[calc(33.33%-16px)]"
                }`}
                  />

                  {/* Second progress line - adjusted to end before last circle */}
                  <div
                    className={`absolute top-[17px] left-[50%] h-[2px] -translate-y-1/2 transition-all duration-300
                ${
                  step === "business"
                    ? "w-0"
                    : step === "additional"
                    ? "bg-green-500 w-[calc(33.33%-16px)]"
                    : "w-0"
                }`}
                  />

                  {/* Step Items */}
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-colors
                  ${
                    step === "basic"
                      ? "bg-white border-blue-500"
                      : step === "business" || step === "additional"
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  }`}
                    >
                      {(step === "business" || step === "additional") && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <h3 className="mt-2 text-xs lg:text-sm font-medium">
                      Company Information
                    </h3>
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-colors
                  ${
                    step === "business"
                      ? "bg-white border-blue-500"
                      : step === "additional"
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  }`}
                    >
                      {step === "additional" && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <h3 className="mt-2 text-xs lg:text-sm font-medium">Contact & Business Details</h3>
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-colors
                  ${
                    step === "additional"
                      ? "bg-white border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                    ></div>
                    <h3 className="mt-2 text-xs lg:text-sm font-medium">Additional Information</h3>
                  </div>
                </div>
              </div>
            </div>

            <CompanyProfileForm step={step} onStepChange={setStep} />
          </div>
        </div>
      </div>
    </div>
  );
} 