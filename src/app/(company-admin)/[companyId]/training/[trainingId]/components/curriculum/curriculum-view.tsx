/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ChevronRight, ChevronDown } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { PrerequisiteResponse } from "@/types/curriculum"

interface CurriculumViewProps {
  prerequisiteData: PrerequisiteResponse
  objectiveData: any
  modeDeliveryData: any
  techRequirementsData: any
  trainerRequirementsData: any
  referencesData: any
  appendicesData: any
  executiveSummaryData: any
  onEdit: () => void
  showEditButton?: boolean
}

export function CurriculumView({ 
  prerequisiteData, 
  objectiveData,
  modeDeliveryData,
  techRequirementsData,
  trainerRequirementsData,
  referencesData,
  appendicesData,
  executiveSummaryData,
  onEdit,
  showEditButton = true
}: CurriculumViewProps) {
  const renderHeader = (title: string) => (
    <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-md md:text-xl">{title}</span>
      </div>
      <div className="text-gray-400 flex gap-2">
        {showEditButton && (
          <img 
            src="/edit.svg" 
            alt="" 
            className="w-5 h-5 cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          />
        )}
        <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
        <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
      </div>
    </AccordionTrigger>
  )

  return (
    <div className="px-[7%] py-10 mb-10">
      <h1 className="text-md md:text-xl text-black mb-4 font-semibold">Curriculum</h1>
      <h2 className="text-md md:text-lg text-gray-500 font-normal mb-4">
        A concise summary of the course, outlining its purpose, scope, and key features
      </h2>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="prerequisites" className="border-[0.5px] border-[#CED4DA] rounded-md">
            {renderHeader("Prerequisites")}
            <AccordionContent>
              <div className="bg-white p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Education Level</h3>
                  <p className="text-gray-600 text-sm md:text-lg">{prerequisiteData.educationLevel?.name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Language</h3>
                  <p className="text-gray-600 text-sm md:text-lg">{prerequisiteData.language?.name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Work Experience</h3>
                  <p className="text-gray-600 text-sm md:text-lg">{prerequisiteData.workExperience?.name || 'N/A'}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="objectives" className="border-[0.5px] border-[#CED4DA] rounded-md">
            {renderHeader("Objective and Outcome")}
            <AccordionContent>
              <div className="bg-white p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">General Objective</h3>
                  <p className="text-gray-600 text-sm md:text-lg">{objectiveData?.generalObjective?.definition || 'N/A'}</p>
                </div>
                {objectiveData?.specificObjectives?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Specific Objectives</h3>
                    {objectiveData.specificObjectives.map((specific: any) => (
                      <div key={specific.id} className="ml-4 mb-4">
                        <p className="text-gray-600 text-sm md:text-lg mb-2">{specific.definition}</p>
                        {specific.outcomes.length > 0 && (
                          <div className="ml-4">
                            <h4 className="font-medium mb-2 text-sm">Outcomes</h4>
                            <ul className="list-disc pl-4">
                              {specific.outcomes.map((outcome: any) => (
                                <li key={outcome.id} className="text-gray-600 text-sm md:text-lg">
                                  {outcome.definition}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="implementation" className="border-[0.5px] border-[#CED4DA] rounded-md">
            {renderHeader("Implementation and Delivery")}
            <AccordionContent>
              <div className="bg-white p-6 space-y-8">
                {/* Mode of Delivery */}
                <div>
                  <h3 className="font-medium mb-4">Mode of Delivery</h3>
                  <div className="space-y-2">
                    {modeDeliveryData?.deliveryTools?.deliveryTools?.map((tool: any) => (
                      <p key={tool.id} className="text-gray-600 text-sm md:text-lg">
                        {tool.name}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Technological Requirements */}
                <div>
                  <h3 className="font-medium mb-4">Technological Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Learner Requirements</h4>
                      <div className="space-y-2">
                        {techRequirementsData?.technologicalRequirements?.learnerTechnologicalRequirements?.map((req: any) => (
                          <p key={req.id} className="text-gray-600 text-sm md:text-lg">
                            {req.name}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Instructor Requirements</h4>
                      <div className="space-y-2">
                        {techRequirementsData?.technologicalRequirements?.instructorTechnologicalRequirements?.map((req: any) => (
                          <p key={req.id} className="text-gray-600 text-sm md:text-lg">
                            {req.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trainer Qualifications */}
                <div>
                  <h3 className="font-medium mb-4">Trainer Qualifications</h3>
                  <div className="space-y-2">
                    {trainerRequirementsData?.trainerRequirements?.trainerRequirements?.map((req: any) => (
                      <p key={req.id} className="text-gray-600 text-sm md:text-lg">
                        {req.name}
                      </p>
                    ))}

                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="references" className="border-[0.5px] border-[#CED4DA] rounded-md">
            {renderHeader("References and Appendices")}
            <AccordionContent>
              <div className="bg-white p-6 space-y-8">
                {/* References */}
                <div>
                  <h3 className="font-medium mb-4">References</h3>
                  <div className="space-y-2">
                    {referencesData?.references?.map((ref: any) => (
                      <p key={ref.id} className="text-gray-600 text-sm md:text-lg">
                        {ref.definition}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Appendices */}
                <div>
                  <h3 className="font-medium mb-4">Appendices</h3>
                  <div className="space-y-2">
                    {appendicesData?.appendices?.map((app: any) => (
                      <p key={app.id} className="text-gray-600 text-sm md:text-lg">
                        {app.definition}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="summary" className="border-[0.5px] border-[#CED4DA] rounded-md">
            {renderHeader("Executive Summary")}
            <AccordionContent>
              <div className="bg-white p-6">
                <p className="text-gray-600 text-sm md:text-lg whitespace-pre-wrap">
                  {executiveSummaryData?.executiveSummary || 'No executive summary available'}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
