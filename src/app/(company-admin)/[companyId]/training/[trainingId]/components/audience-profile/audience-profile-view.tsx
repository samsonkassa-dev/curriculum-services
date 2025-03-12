"use client"

import { ChevronRight, ChevronDown } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface BaseItem {
  id: string
  name: string
  description: string
}

interface AudienceProfile {
  id: string
  trainingId: string
  learnerLevel: BaseItem
  language?: BaseItem
  educationLevel?: BaseItem
  specificCourseList?: string[]
  certifications?: string
  licenses?: string
  workExperience?: BaseItem
  specificPrerequisites?: string[]
}

interface AudienceProfileViewProps {
  audienceProfile: AudienceProfile
  onEdit: () => void
  showEditButton?: boolean
}

export function AudienceProfileView({ 
  audienceProfile, 
  onEdit,
  showEditButton = true
}: AudienceProfileViewProps) {
  const learnerLevel = audienceProfile?.learnerLevel
  const language = audienceProfile?.language
  const educationLevel = audienceProfile?.educationLevel
  const specificCourseList = audienceProfile?.specificCourseList || []
  const certifications = audienceProfile?.certifications || ''
  const licenses = audienceProfile?.licenses || ''
  const workExperience = audienceProfile?.workExperience
  const specificPrerequisites = audienceProfile?.specificPrerequisites || []

  const renderHeader = (title: string) => (
    <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-md md:text-xl">{title}</span>
      </div>
      <div className="text-gray-400 flex gap-2">
        {showEditButton && (
          <img 
            src="/edit.svg" 
            alt="Edit" 
            className="w-5 h-5 cursor-pointer" 
            onClick={onEdit}
          />
        )}
        <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
        <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
      </div>
    </AccordionTrigger>
  )

  return (
    <div className="px-[7%] py-10 mb-10">
      <h1 className="text-md md:text-xl text-black mb-4 font-semibold">Audience Profile</h1>

      <h2 className="text-md md:text-lg text-gray-500 font-normal mb-4">
        A concise summary of the course audience, outlining their learning level and prerequisites
      </h2>
      <div className="space-y-4">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="learner" className="border-[0.5px] border-[#CED4DA] rounded-md">
            {renderHeader("Learner Characteristics")}
            <AccordionContent>
              <div className="bg-white p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Learning Level</h3>
                  <p className="text-gray-600 text-sm ">{learnerLevel?.name || 'N/A'}</p>

                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prerequisites" className="border-[0.5px] border-[#CED4DA] rounded-md">
            {renderHeader("Prerequisites")}
            <AccordionContent>
              <div className="bg-white p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Language</h3>
                  <p className="text-gray-600 text-sm md:text-lg">{language?.name || 'None specified'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Education Level</h3>
                  <p className="text-gray-600 text-sm md:text-lg">{educationLevel?.name || 'None specified'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Work Experience</h3>
                  <p className="text-gray-600 text-sm md:text-lg">{workExperience?.name || 'None specified'}</p>
                </div>
                
                {specificCourseList.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Specific Course Requirements</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {specificCourseList.map((course, index) => (
                        <li key={index} className="text-gray-600 text-sm md:text-lg">
                          {course}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {certifications && (
                  <div>
                    <h3 className="font-medium mb-2">Certifications</h3>
                    <p className="text-gray-600 text-sm md:text-lg whitespace-pre-line">{certifications}</p>
                  </div>
                )}
                
                {licenses && (
                  <div>
                    <h3 className="font-medium mb-2">Licenses</h3>
                    <p className="text-gray-600 text-sm md:text-lg whitespace-pre-line">{licenses}</p>
                  </div>
                )}
                
                {specificPrerequisites.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Specific Prerequisites</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {specificPrerequisites.map((prerequisite, index) => (
                        <li key={index} className="text-gray-600 text-sm md:text-lg">
                          {prerequisite}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {!language && !educationLevel && !workExperience && 
                 specificCourseList.length === 0 && !certifications && !licenses && 
                 specificPrerequisites.length === 0 && (
                  <p className="text-gray-600 text-sm md:text-lg">No prerequisites specified</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
