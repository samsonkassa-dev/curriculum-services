/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useCallback, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronRight, ChevronDown, MoreVertical } from "lucide-react"
import Image from "next/image"
import { useAssessmentForm } from "@/contexts/AssessmentFormContext"
import { AssessmentFormProvider } from "@/contexts/AssessmentFormContext"
import { LessonAddModal } from "./section/lessonAddModal"
import { useCreateLesson, useGetLessons } from "@/lib/hooks/useLesson"

interface AssessmentMethod {
  id: string
  name: string
  description: string
  assessmentSubType: 'GENERAL_FORMATIVE' | 'ALTERNATIVE_FORMATIVE' | 'TECHNOLOGY_SPECIFIC_FORMATIVE'
}

interface SectionAssessment {
  sectionId: string
  assessmentMethods: AssessmentMethod[]
  subjectSpecificAssessmentMethod: string
}

interface Lesson {
  id: string
  name: string
  description: string
  sectionId: string
}

interface Section {
  id: string
  name: string
  topic: string
  creditHour: number
  description: string
  lessons: Lesson[]
}

interface LessonFormData {
  name: string
  description: string
}

interface SectionViewProps {
  sections: Section[]
  onAddClick: () => void
  onEditClick: (section: Section) => void
  onLessonClick: (sectionId: string) => void
  onAssessmentClick: (sectionId: string) => void
  isLoading?: boolean
  error?: Error
}

export function SectionView({ 
  sections, 
  onAddClick, 
  onEditClick,
  onLessonClick,
  onAssessmentClick,
  error 
}: SectionViewProps) {
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [editingLesson, setEditingLesson] = useState<LessonFormData | undefined>(undefined)
  const { mutateAsync: createLesson } = useCreateLesson()

  const handleAddLesson = async (data: { name: string; description: string }) => {
    if (!selectedSection) return
    
    await createLesson({
      ...data,
      sectionId: selectedSection.id
    })
    setShowLessonModal(false)
    setSelectedSection(null)
  }

  const handleLessonClick = (section: Section) => {
    setSelectedSection(section)
    setShowLessonModal(true)
  }

  const handleEditLesson = (lesson: Lesson, section: Section) => {
    console.log('Editing lesson:', lesson)
    setSelectedSection(section)
    setEditingLesson({
      name: lesson.name,
      description: lesson.description
    })
    setShowLessonModal(true)
  }

  const renderHeader = useCallback((section: Section, index: number) => (
    <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] border-[0.5px] border-[#CED4DA] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-md md:text-xl">
            Section {index + 1} - {section.name}
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Image
              src="/clockS.svg"
              alt="Credit Hour"
              width={16}
              height={16}
            />
            <span>{section.creditHour} Credit Hour</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/time.svg"
              alt="Weeks"
              width={16}
              height={16}
            />
            <span>2 Weeks</span>
          </div>
        </div>
      </div>
      <div className="text-gray-400 flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              className="hover:bg-gray-100 h-8 w-8 p-0 rounded-md flex items-center justify-center cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditClick(section)}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center">
          <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
          <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
        </div>
      </div>
    </AccordionTrigger>
  ), [onEditClick])

  const renderAssessmentContent = (section: Section) => {
    return (
      <AssessmentFormProvider sectionId={section.id}>
        <AssessmentContent section={section} onAssessmentClick={onAssessmentClick} />
      </AssessmentFormProvider>
    )
  }

  function AssessmentContent({ 
    section, 
    onAssessmentClick 
  }: { 
    section: Section
    onAssessmentClick: (sectionId: string) => void 
  }) {
    const { hasAssessmentMethods } = useAssessmentForm()

    if (hasAssessmentMethods) {
      return (
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
        >
          <span>Assessment Methods</span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                className="hover:bg-gray-100 h-8 w-8 p-0 rounded-md flex items-center justify-center cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAssessmentClick(section.id)}>
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }

    return (
      <div 
        onClick={() => onAssessmentClick(section.id)}
        className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md cursor-pointer"
      >
        <Image
          src="/modulePlus.svg"
          alt="Add Assessment"
          width={16}
          height={20}
        />
        <span>Assessment Methods</span>
      </div>
    )
  }

  const renderLessonContent = (section: Section) => {
    return (
      <>
        <div 
          onClick={() => handleLessonClick(section)}
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md cursor-pointer"
        >
          <Image
            src="/modulePlus.svg"
            alt="Add Lesson"
            width={16}
            height={20}
          />
          <span>Lesson</span>
        </div>
        
        {section.lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
            <span>{lesson.name}</span>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className="hover:bg-gray-100 h-8 w-8 p-0 rounded-md flex items-center justify-center cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditLesson(lesson, section)}>
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </>
    )
  }

  if (error) {
    return <div className="text-red-500">Error loading sections: {error.message}</div>
  }

  return (
    <>
      <div className="space-y-4">
        <Accordion type="single" collapsible defaultValue="" className="space-y-4">
          {sections.map((section, index) => (
            <AccordionItem key={section.id} value={section.id} className="border-none">
              {renderHeader(section, index)}
              <AccordionContent>
                <div className="bg-white p-6">
                  <div className="flex flex-col gap-4">
                    {renderLessonContent(section)}
                    {renderAssessmentContent(section)}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <LessonAddModal 
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false)
          setSelectedSection(null)
          setEditingLesson(undefined)
        }}
        onSubmit={handleAddLesson}
        initialData={editingLesson}
        isEdit={!!editingLesson}
      />
    </>
  )
} 