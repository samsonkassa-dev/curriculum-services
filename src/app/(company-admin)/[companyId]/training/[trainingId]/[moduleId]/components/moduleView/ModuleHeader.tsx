import { ChevronDown, MoreVertical } from "lucide-react"
import { AccordionTrigger } from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModuleHeaderProps } from "./types"

export function ModuleHeader({ 
  title, 
  index, 
  module, 
  canEdit,
  onEditClick,
  onAssessmentClick 
}: ModuleHeaderProps) {
  return (
    <div className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg m-6 flex items-center justify-between hover:no-underline group">
      <div 
        className="flex items-center gap-3 flex-1 cursor-pointer" 
        onClick={(e) => onAssessmentClick(module.id, e)}
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
        <AccordionTrigger className="p-1 hover:bg-gray-100 rounded-md data-[state=open]:rotate-180 transition-transform">
          <ChevronDown className="h-5 w-5 text-black" />
        </AccordionTrigger>
      </div>
    </div>
  )
} 