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
  academicLevel: BaseItem
  learnerStylePreferences: BaseItem[]
  priorKnowledgeList: string[]
  professionalBackground: string
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
  const academicLevel = audienceProfile?.academicLevel
  const learnerStylePreferences = audienceProfile?.learnerStylePreferences || []

  const priorKnowledgeList = audienceProfile?.priorKnowledgeList || []
  const professionalBackground = audienceProfile?.professionalBackground || ''

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
            onClick={onEdit}
          />
        )}
        <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
        <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
      </div>
    </AccordionTrigger>
  )

  return (
    <div className="md:w-[calc(100%-85px)] md:pl-[65px] px-[10px] mx-auto">
      <div className="space-y-4">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="learner" className="border-none">
            {renderHeader("Learner Characteristics")}
            <AccordionContent>
              <div className="bg-white p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Learning Level</h3>
                  <p className="text-gray-600 text-sm md:text-lg">{learnerLevel?.name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Academic Level</h3>
                  <p className="text-gray-600 text-sm md:text-lg">{academicLevel?.name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Learning Style Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {learnerStylePreferences.map((style) => (
                      <span 
                        key={style.id} 
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {style.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prior" className="border-none">
            {renderHeader("Prior Knowledge")}
            <AccordionContent>
              <div className="bg-white p-6">
                <ul className="list-disc pl-5 space-y-2">
                  {priorKnowledgeList.map((knowledge, index) => (
                    <li key={index} className="text-gray-600 text-sm md:text-lg">
                      {knowledge}
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="professional" className="border-none">
            {renderHeader("Professional Background")}
            <AccordionContent>
              <div className="bg-white p-6">
                <p className="text-gray-600 text-sm md:text-lg">
                  {professionalBackground || 'No professional background specified'}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
