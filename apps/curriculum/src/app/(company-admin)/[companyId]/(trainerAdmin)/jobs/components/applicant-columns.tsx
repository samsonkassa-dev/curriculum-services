"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Application } from "@/lib/hooks/useApplication"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EyeIcon } from "lucide-react"

// Helper function to generate avatar fallback from name
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// ActionCell component to handle eye icon click - centered
const ActionCell = ({ 
  application, 
  onEyeClick 
}: { 
  application: Application; 
  onEyeClick?: () => void;
}) => {
  return (
    <div className="flex items-center justify-center w-full">
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-8 w-8 text-blue-500 flex items-center justify-center"
        onClick={onEyeClick}
      >
        <EyeIcon className="h-5 w-5" />
      </Button>
    </div>
  )
}

export const createApplicantColumns = (onEyeClick?: () => void): ColumnDef<Application>[] => [
  {
    accessorKey: "trainer",
    header: "Full Name",
    cell: ({ row }) => {
      const trainer = row.original.trainer
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-400 bg-opacity-60 flex items-center justify-center text-white text-sm font-medium">
            {getInitials(trainer.firstName, trainer.lastName)}
          </div>
          <span className="font-normal">
            {trainer.firstName} {trainer.lastName}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: "trainer.email",
    header: "Email",
    cell: ({ row }) => row.original.trainer.email
  },
  {
    accessorKey: "trainer.experienceYears",
    header: "Years of Experience",
    cell: ({ row }) => `${row.original.trainer.experienceYears} years`
  },
  {
    accessorKey: "applicationType",
    header: "Application Type",
    cell: ({ row }) => {
      const type = row.original.applicationType
      
      return (
        <Badge 
          variant="secondary"
          className="capitalize"
        >
          {type.toLowerCase()}
        </Badge>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Application Status",
    cell: ({ row }) => {
      const status = row.original.status
      
      return (
        <Badge 
          variant={status.toLowerCase() as "pending" | "accepted" | "rejected"}
          className="capitalize"
        >
          {status.toLowerCase()}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <ActionCell application={row.original} onEyeClick={onEyeClick} />
    )
  }
]

// Export default columns for backward compatibility
export const applicantColumns = createApplicantColumns()