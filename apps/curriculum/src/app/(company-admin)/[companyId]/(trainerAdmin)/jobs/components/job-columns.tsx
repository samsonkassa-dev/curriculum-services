"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Application } from "@/lib/hooks/useApplication"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// ActionButton component to handle useParams hook
const ActionButton = ({ applicationId }: { applicationId: string }) => {
  const params = useParams();
  const companyId = params.companyId as string;
  
  return (
    <Link href={`/${companyId}/jobs/applications/${applicationId}`}>
      <Button size="sm" className="text-xs rounded-[30px] bg-blue-600 text-white hover:bg-blue-700">
        View Applicant
      </Button>
    </Link>
  );
}

export const jobColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "job.title",
    header: "Job Title",
    cell: ({ row }) => <div className="font-medium">{row.original.job.title}</div>
  },
  {
    accessorKey: "job.numberOfSessions",
    header: "Number Of Sessions",
    cell: ({ row }) => row.original.job.numberOfSessions
  },
  {
    accessorKey: "job.applicantsRequired",
    header: "Applicants",
    cell: ({ row }) => row.original.job.applicantsRequired
  },
  {
    accessorKey: "job.createdAt",
    header: "Date Posted",
    cell: ({ row }) => formatDate(row.original.job.createdAt)
  },
  {
    accessorKey: "job.deadlineDate",
    header: "Date Closed",
    cell: ({ row }) => formatDate(row.original.job.deadlineDate)
  },
  {
    accessorKey: "job.status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.job.status
      
      // Set color based on status
      let color = "bg-green-100 text-green-800"
      if (status === "CLOSED") {
        color = "bg-gray-100 text-gray-800"
      } else if (status === "DRAFT") {
        color = "bg-blue-100 text-blue-800"
      }
      
      return (
        <Badge 
          className={`${color} border-0 font-medium capitalize`}
        >
          <span className={`mr-1.5 h-2 w-2 rounded-full ${status === "ACTIVE" ? "bg-green-600" : status === "CLOSED" ? "bg-gray-500" : "bg-blue-600"}`} />
          {status.toLowerCase()}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionButton applicationId={row.original.id} />
    )
  }
] 