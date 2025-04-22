"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from 'date-fns'
import { Job } from "@/lib/hooks/useJobs" 
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the *actual* allowed badge variants based on the linter error
type AllowedBadgeVariant = 'active' | 'pending' | 'accepted' | 'rejected' | 'deactivated' | 'deleted' | 'approved';

// Function to determine badge variant based on status
const getStatusBadgeVariant = (status: Job['status']): AllowedBadgeVariant => {
  switch (status) {
    case 'ACTIVE':
      return 'active' 
    case 'INACTIVE':
      return 'deactivated' 
    case 'COMPLETED':
      return 'approved' // Map COMPLETED to approved
    // Add cases for other potential Job['status'] values if they exist
    // default: 
      // return 'pending' // Optional: Provide a fallback if Job['status'] can have unexpected values
  }
  // If the switch is exhaustive for Job['status'], this part might be unreachable.
  // Adding a fallback return to satisfy TypeScript if status could potentially be undefined/null
  // or if Job['status'] type definition changes later.
  return 'pending'; // Default fallback if switch doesn't cover all possibilities
}

export const createJobColumns = (onViewDetails: (jobId: string) => void): ColumnDef<Job>[] => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      // Optional: Truncate long descriptions
      const truncatedDescription = description.length > 50 
        ? description.substring(0, 47) + "..." 
        : description
      return <div className="text-sm text-muted-foreground">{truncatedDescription}</div>
    },
  },
  {
    accessorKey: "numberOfSessions",
    header: "Sessions",
    cell: ({ row }) => <div className="text-center">{row.getValue("numberOfSessions")}</div>,
  },
   {
    accessorKey: "applicantsRequired",
    header: "Applicants Needed",
    cell: ({ row }) => <div className="text-center">{row.getValue("applicantsRequired")}</div>,
  },
  {
    accessorKey: "deadlineDate",
    header: "Deadline",
    cell: ({ row }) => {
      const date = row.getValue("deadlineDate") as string
      return <div>{format(new Date(date), 'PP')}</div> // Format date nicely
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Job['status'];
      const variant = getStatusBadgeVariant(status);
      // Ensure status is treated as string for toLowerCase
      const displayStatus = String(status || '').toLowerCase(); 
      return (
        <Badge variant={variant} className="capitalize">
          {displayStatus}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const job = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(job.id)}
            >
              Copy Job ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onViewDetails(job.id)}
            >
              View Details
            </DropdownMenuItem> 
            {/* Add other actions like Edit, Delete, View Applicants later */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Keep the original jobColumns for backward compatibility
export const jobColumns = createJobColumns(() => {
  // Fallback to old custom event pattern if used without the new pattern
  document.dispatchEvent(
    new CustomEvent("view-job-details", { detail: { jobId: '' } })
  )
}) 