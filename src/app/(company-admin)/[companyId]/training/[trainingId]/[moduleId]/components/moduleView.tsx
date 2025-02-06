"use client"

import { ChevronRight, ChevronDown, MoreVertical } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Module } from "@/types/module"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useCallback } from "react"

interface ModuleViewProps {
  modules: Module[]
  onAddClick: () => void
  onEditClick: (module: Module) => void
  canEdit?: boolean
  isLoading?: boolean
  error?: Error
}

export function ModuleView({ 
  modules, 
  onAddClick, 
  onEditClick,
  canEdit = false,
  error 
}: ModuleViewProps) {
  const router = useRouter()
  const params = useParams()

  const handleAssessmentClick = useCallback((moduleId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/${params.companyId}/training/${params.trainingId}/${moduleId}`)
  }, [router, params.companyId, params.trainingId])

  const renderHeader = useCallback((title: string, index: number, module: Module) => (
    <div className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
      <div 
        className="flex items-center gap-3 flex-1 cursor-pointer" 
        onClick={(e) => handleAssessmentClick(module.id, e)}
      >
        <span className="font-semibold text-md md:text-xl">
          Module {index + 1} - {title}
        </span>
      </div>
      <div className="text-gray-400 flex items-center gap-2">
        {canEdit && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div 
                role="button"
                tabIndex={0}
                className="hover:bg-gray-100 h-8 w-8 p-0 rounded-md flex items-center justify-center cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditClick(module)}>
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <AccordionTrigger className="p-1 hover:bg-gray-100 rounded-md">
          <div className="flex items-center">
            <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
            <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
          </div>
        </AccordionTrigger>
      </div>
    </div>
  ), [onEditClick, handleAssessmentClick, canEdit])

  if (error) {
    return <div className="text-red-500">Error loading modules: {error.message}</div>
  }

  return (
    <div className="px-[7%] py-10 mb-10">
      <h1 className="text-md md:text-xl text-black mb-4 font-semibold">Modules</h1>
      <h2 className="text-md md:text-lg text-gray-500 font-normal mb-4">
        A concise summary of the course modules, outlining their content and structure
      </h2>

      <div className="space-y-4">
        <Accordion type="single" collapsible defaultValue="" className="space-y-4">
          {modules.map((module, index) => (
            <AccordionItem key={module.id} value={module.id} className="border-[0.5px] border-[#CED4DA] rounded-md">
              {renderHeader(module.name, index, module)}
              <AccordionContent>
                <div className="bg-white p-6">
                  <div 
                    onClick={(e) => handleAssessmentClick(module.id, e)}
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
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {canEdit && (
        <Button 
          variant="ghost" 
          className="w-full border-2 border-dashed rounded-lg py-8 text-blue-500 hover:text-blue-600 bg-[#fbfbfb] hover:bg-blue-50/50 mt-4 justify-start pl-6"
          onClick={onAddClick}
        >
          <Image
            src="/modulePlus.svg"
            alt="Add Module"
            width={16}
            height={20}
          />
          <span className="font-semibold">Module</span>
        </Button>
      )}
    </div>
  )
}