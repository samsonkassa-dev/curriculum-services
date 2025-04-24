"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Application } from "@/lib/hooks/useApplication"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EyeIcon } from "lucide-react"
import { useState } from "react"

// Helper function to generate avatar fallback from name
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Helper function to render star rating
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-300' : 'text-gray-300'}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 22 20"
        >
          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
        </svg>
      ))}
    </div>
  )
}

// ActionCell component to handle state and hooks
const ActionCell = ({ application }: { application: Application }) => {
  const [isUpdating, setIsUpdating] = useState(false)
  // const { updateStatus } = useUpdateApplicationStatus()
  const applicationId = application.id
  const status = application.status
  
  const handleUpdateStatus = (newStatus: "ACCEPTED" | "REJECTED") => {
    setIsUpdating(true)
    // updateStatus(
    //   { applicationId, status: newStatus },
    //   {
    //     onSettled: () => setIsUpdating(false)
    //   }
    // )
  }
  
  return (
    <div className="flex items-center justify-center">
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-8 w-8 text-blue-500"
      >
        <EyeIcon className="h-5 w-5" />
      </Button>
      
      {status === "PENDING" && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="ml-2 text-green-600 border-green-600 hover:bg-green-50"
            onClick={() => handleUpdateStatus("ACCEPTED")}
            disabled={isUpdating}
          >
            Accept
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="ml-2 text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => handleUpdateStatus("REJECTED")}
            disabled={isUpdating}
          >
            Reject
          </Button>
        </>
      )}
    </div>
  )
}

export const applicantColumns: ColumnDef<Application>[] = [
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
    header: "Years Experience",
    cell: ({ row }) => {
      const years = row.original.trainer.experienceYears
      return years > 1 ? `${years} years` : `${years} year`
    }
  },
  {
    accessorKey: "trainer.rating",
    header: "Rating",
    cell: ({ row }) => {
      // Mock rating - in real application this would come from the API
      const rating = Math.floor(Math.random() * 5) + 1
      return <StarRating rating={rating} />
    }
  },
  {
    accessorKey: "status",
    header: "Application Status",
    cell: ({ row }) => {
      const status = row.original.status
      
      // Set color based on status
      let color = "bg-yellow-100 text-yellow-800"
      if (status === "ACCEPTED") {
        color = "bg-green-100 text-green-800"
      } else if (status === "REJECTED") {
        color = "bg-red-100 text-red-800"
      }
      
      // Set dot color based on status
      const dotColor = status === "ACCEPTED" 
        ? "bg-green-600" 
        : status === "REJECTED" 
          ? "bg-red-600" 
          : "bg-yellow-600"
      
      return (
        <Badge 
          className={`${color} border-0 font-medium capitalize`}
        >
          <span className={`mr-1.5 h-2 w-2 rounded-full ${dotColor}`} />
          {status.toLowerCase()}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell application={row.original} />
  }
] 