"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import { TrainingNotFound } from "./training-not-found";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { OverviewEdit } from "./overview/overview-edit";
import { Training } from "@/types/training";

export function Overview({ training }: { training: Training }) {
  const [isEditing, setIsEditing] = useState(false)
  const userRole = localStorage.getItem("user_role")
  const isCompanyAdmin = userRole === "ROLE_COMPANY_ADMIN"

  if (isEditing) {
    return (
      <OverviewEdit 
        training={training}
        onSave={(data) => {
          // Handle save
          setIsEditing(false)
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
                    onClick={() => setIsEditing(true)}
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
                    onClick={() => setIsEditing(true)}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <p className="text-gray-600 text-sm md:text-lg">
                  {training.cities[0]?.name || "N/A"}
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
                    onClick={() => setIsEditing(true)}
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
                    onClick={() => setIsEditing(true)}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm md:text-lg">
                    Gender: {training.genderPercentages.map(g => `${g.gender.charAt(0)}${g.gender.slice(1).toLowerCase()} (${g.percentage}%)`).join(", ")}
                  </p>
                </div>
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
                    onClick={() => setIsEditing(true)}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <p className="text-gray-600 text-sm md:text-lg">
                  {training.trainingPurposes[0]?.name || "N/A"}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
