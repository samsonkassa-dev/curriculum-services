"use client"

import { Application } from "@/lib/hooks/useApplication"
import { Badge } from "@/components/ui/badge"

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

interface ApplicationCardProps {
  application: Application
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { job, status } = application
  
  // Set color based on status
  let statusColor = "bg-yellow-100 text-yellow-800"
  if (status === "ACCEPTED") {
    statusColor = "bg-green-100 text-green-800"
  } else if (status === "REJECTED") {
    statusColor = "bg-red-100 text-red-800"
  }
  
  // Set dot color based on status
  const dotColor = status === "ACCEPTED" 
    ? "bg-green-600" 
    : status === "REJECTED" 
      ? "bg-red-600" 
      : "bg-yellow-600"

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap md:flex-nowrap gap-6 md:gap-12">
        {/* Job Title */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-600">Job Title</span>
          <span className="text-sm text-gray-600">{job.title}</span>
        </div>
        
        {/* Job Type */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-600">Job Type</span>
          <span className="text-sm text-blue-600">Full-Time</span>
        </div>
        
        {/* Date Posted */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-600">Date Posted</span>
          <span className="text-sm text-gray-600">{formatDate(job.createdAt)}</span>
        </div>
        
        {/* Date Closed */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-600">Date Closed</span>
          <span className="text-sm text-gray-600">{formatDate(job.deadlineDate)}</span>
        </div>
        
        {/* Status */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-600">Status</span>
          <Badge className={`${statusColor} border-0 font-medium capitalize`}>
            <span className={`mr-1.5 h-2 w-2 rounded-full ${dotColor}`} />
            {job.status.toLowerCase()}
          </Badge>
        </div>
        
        {/* Application Status */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-600">Application Status</span>
          <Badge className={`${statusColor} border-0 font-medium capitalize`}>
            <span className={`mr-1.5 h-2 w-2 rounded-full ${dotColor}`} />
            {status.toLowerCase()}
          </Badge>
        </div>
      </div>
    </div>
  )
} 