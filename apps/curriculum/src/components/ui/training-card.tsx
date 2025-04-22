"use client"

import { Button } from "@/components/ui/button"
import { MoreVertical, Archive } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useArchiveTraining, useUnarchiveTraining } from "@/lib/hooks/useTrainings"
import { useUserRole } from "@/lib/hooks/useUserRole"


interface TrainingCardProps {
  id: string
  title: string
  rationale: string
  location: string
  duration: string
  ageGroup: string
  isArchived?: boolean
}

export function TrainingCard({ 
  id,
  title, 
  rationale,
  location, 
  duration, 
  ageGroup,
  isArchived = false,
}: TrainingCardProps) {
  const router = useRouter()
  const params = useParams()
  const { mutateAsync: archiveTraining } = useArchiveTraining()
  const { mutateAsync: unarchiveTraining } = useUnarchiveTraining()
  const { isCompanyAdmin } = useUserRole()

  const handleViewTraining = () => {
    router.push(`/${params.companyId}/training/${id}`)
  }

  const handleArchive = async () => {
    try {
      await archiveTraining(id)
    } catch (error) {
      console.error("Error archiving training:", error)
    }
  }

  const handleUnarchive = async () => {
    try {
      await unarchiveTraining(id)
    } catch (error) {
      console.error("Error unarchiving training:", error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-custom border-[0.5px] border-[#E4E4E4] p-8 relative">
      {isCompanyAdmin && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4">
            <MoreVertical className="h-4 w-4 text-brand" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isArchived ? (
            <DropdownMenuItem onClick={handleUnarchive} className="text-green-600">
              <Archive className="mr-2 h-4 w-4 rotate-180" />
              Unarchive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleArchive} className="text-red-600">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      )}

      <h3 className="text-xl md:text-2xl font-semibold text-brand mb-4">
        {title}
      </h3>

      <div className="flex items-center gap-3 lg:text-[12px] text-[11px] text-[#9C9791] mb-4">
        <div className="flex items-center gap-1">
          <img src="/location.svg" alt="" className="w-4 h-4" />
          <p className="text-[#9C9791]">{location}</p>
        </div>
        <div className="flex items-center gap-1">
          <img src="/clock.svg" alt="" className="w-4 h-4" />
          {duration}
        </div>
        <div className="flex items-center gap-1">
          {/* <img src="/age.svg" alt="" className="w-4 h-4" /> */}
          {ageGroup}
        </div>
      </div>

      <p className="text-sm font-light text-[#292827] mb-4 line-clamp-3">
        {rationale}
      </p>

      <div className="flex items-end justify-end py-3">
        <Button
          variant="link"
          className="text-brand hover:text-brand-primary p-0 h-auto font-medium text-sm md:text-md"
          onClick={handleViewTraining}
        >
          View training
          <img src="/rightArrow.svg" alt="" className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
} 