"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { OverviewEdit } from "./overview/overview-edit";
import { Training } from "@/types/training";
import { useUpdateTraining } from "@/lib/hooks/useUpdateTraining";

type SectionName = "title" | "location" | "duration" | "target" | "purpose" | "type" | "rationale"

export function Overview({ training }: { training: Training }) {
  const [isEditing, setIsEditing] = useState(false)
  const [initialStep, setInitialStep] = useState(1)
  const userRole = localStorage.getItem("user_role")
  const isCompanyAdmin = userRole === "ROLE_COMPANY_ADMIN"
  const { mutate: updateTraining, isPending } = useUpdateTraining()

  const handleEdit = (section: SectionName) => {
    // Map section to step number
    const stepMap: Record<SectionName, number> = {
      title: 1,
      location: 2,
      duration: 2,
      target: 3,
      purpose: 5,
      type: 1,
      rationale: 1
    }
    setInitialStep(stepMap[section])
    setIsEditing(true)
  }

  if (isEditing) {
    return (
      <OverviewEdit 
        training={training}
        initialStep={initialStep}
        onSave={(data) => {
          updateTraining(
            { id: training.id, data },
            {
              onSuccess: () => setIsEditing(false)
            }
          )
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="px-[7%] py-10 mb-10">
      <h1 className="text-md md:text-xl text-black mb-4 font-semibold">Overview</h1>

      <h2 className="text-md md:text-lg text-gray-500 font-normal mb-4">
        A concise summary of the course, outlining its purpose, scope, and key
        features
      </h2>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="space-y-4">
          {/* Title Section */}
          <AccordionItem value="title" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Title</span>
              </div>
              <div className="text-gray-400 flex gap-2">
                {isCompanyAdmin && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit("title")
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <div className="space-y-6">
                  <p className="text-gray-600 md:text-lg text-sm">{training.title}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Location Section */}
          <AccordionItem value="location" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Location</span>
              </div>
              <div className="text-gray-400 flex gap-2">
                {isCompanyAdmin && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit("location")
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <p className="text-gray-600 text-sm md:text-lg">
                  {training.cities.length > 0 
                    ? training.cities.map(city => city.name).join(", ")
                    : "N/A"}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Duration Section */}
          <AccordionItem value="duration" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Duration</span>
              </div>
              <div className="text-gray-400 flex gap-2  ">
                {isCompanyAdmin && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit("duration")
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <p className="text-gray-600 text-sm md:text-lg">{`${
                  training.duration
                } ${training.durationType.toLowerCase()}`}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Target Audience Section */}
          <AccordionItem value="target" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Target Audience</span>
              </div>
              <div className="text-gray-400 flex gap-2  ">
                {isCompanyAdmin && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit("target")
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6 space-y-4">
                {/* Gender */}
                <div>
                  <h3 className="text-gray-700 font-medium mb-1">Gender Distribution:</h3>
                  <p className="text-gray-600 text-sm md:text-lg">
                    {training.genderPercentages.map(g => `${g.gender.charAt(0)}${g.gender.slice(1).toLowerCase()} (${g.percentage}%)`).join(", ")}
                  </p>
                </div>

                {/* Age Groups */}
                {training.ageGroups?.length > 0 && (
                  <div>
                    <h3 className="text-gray-700 font-medium mb-1">Age Groups:</h3>
                    <p className="text-gray-600 text-sm md:text-lg">
                      {training.ageGroups.map(age => age.name).join(", ")}
                    </p>
                  </div>
                )}

                {/* Economic Backgrounds */}
                {training.economicBackgrounds?.length > 0 && (
                  <div>
                    <h3 className="text-gray-700 font-medium mb-1">Economic Backgrounds:</h3>
                    <p className="text-gray-600 text-sm md:text-lg">
                      {training.economicBackgrounds.map(eb => eb.name).join(", ")}
                    </p>
                  </div>
                )}

                {/* Academic Qualifications */}
                {training.academicQualifications?.length > 0 && (
                  <div>
                    <h3 className="text-gray-700 font-medium mb-1">Academic Qualifications:</h3>
                    <p className="text-gray-600 text-sm md:text-lg">
                      {training.academicQualifications.map(aq => aq.name).join(", ")}
                    </p>
                  </div>
                )}

                {/* Disability Information */}
                {training.disabilityPercentages?.length > 0 && (
                  <div>
                    <h3 className="text-gray-700 font-medium mb-1">Disability Distribution:</h3>
                    <p className="text-gray-600 text-sm md:text-lg">
                      {training.disabilityPercentages.map(d => 
                        `${d.disability.name} (${d.percentage}%)`).join(", ")}
                    </p>
                  </div>
                )}

                {/* Marginalized Groups */}
                {training.marginalizedGroupPercentages?.length > 0 && (
                  <div>
                    <h3 className="text-gray-700 font-medium mb-1">Marginalized Groups:</h3>
                    <p className="text-gray-600 text-sm md:text-lg">
                      {training.marginalizedGroupPercentages.map(mg => 
                        `${mg.marginalizedGroup.name} (${mg.percentage}%)`).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Purpose Section */}
          <AccordionItem value="purpose" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">
                  Purpose of the training
                </span>
              </div>
              <div className="text-gray-400 flex gap-2 ">
                {isCompanyAdmin && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit("purpose")
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <p className="text-gray-600 text-sm md:text-lg">
                  {training.trainingPurposes.length > 0 
                    ? training.trainingPurposes.map(purpose => purpose.name).join(", ")
                    : "N/A"}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Training Type Section */}
          <AccordionItem value="type" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">
                  Training Type
                </span>
              </div>
              <div className="text-gray-400 flex gap-2 ">
                {isCompanyAdmin && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit("type")
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm md:text-lg font-medium">
                    {training.trainingType?.name || "N/A"}
                  </p>
                  {training.trainingType?.description && (
                    <p className="text-gray-500 text-sm md:text-base">
                      {training.trainingType.description}
                    </p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Rationale Section */}
          <AccordionItem value="rationale" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">
                  Rationale
                </span>
              </div>
              <div className="text-gray-400 flex gap-2 ">
                {isCompanyAdmin && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit("rationale")
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <p className="text-gray-600 text-sm md:text-lg">
                  {training.rationale || "N/A"}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
