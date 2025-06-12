"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from 'date-fns'
import { Job } from "@/lib/hooks/useJobs" 
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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

export const createJobColumns = (onEditJob: (jobId: string) => void, onDeleteJob: (jobId: string) => void): ColumnDef<Job>[] => [
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
      // Truncate long descriptions but allow more space
      const truncatedDescription = description.length > 80 
        ? description.substring(0, 77) + "..." 
        : description
      return (
        <div className="text-sm text-muted-foreground max-w-xs" title={description}>
          {truncatedDescription}
        </div>
      )
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
      return (
        <div className="text-sm">
          <div>{format(new Date(date), 'MMM dd, yyyy')}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(date), 'h:mm a')}
          </div>
        </div>
      )
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
    header: "Actions",
    cell: ({ row }) => {
      const job = row.original

      return (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditJob(job.id)}
            className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDeleteJob(job.id)}
            className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      )
    },
  },
]

// Keep the original jobColumns for backward compatibility
export const jobColumns = createJobColumns(() => {
  // Fallback for edit action
  console.log('Edit action not implemented')
}, () => {
  // Fallback for delete action
  console.log('Delete action not implemented')
}) 