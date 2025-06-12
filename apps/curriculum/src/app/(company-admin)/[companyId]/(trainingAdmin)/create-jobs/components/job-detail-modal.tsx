"use client"

import { useEffect } from "react"
import { format } from "date-fns"
import { useJobDetail } from "@/lib/hooks/useJobs"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"

interface JobDetailModalProps {
  jobId: string
  isOpen: boolean
  onClose: () => void
}

// Function to determine badge variant based on status
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'active' 
    case 'INACTIVE':
      return 'deactivated' 
    case 'COMPLETED':
      return 'approved'
    default:
      return 'pending'
  }
}

export function JobDetailModal({ jobId, isOpen, onClose }: JobDetailModalProps) {
  const { data: job, isLoading, error } = useJobDetail(jobId)

  // Make sure we don't try to access the Dialog when not open
  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[580px] p-0 rounded-2xl max-h-[85vh] overflow-hidden" 
      >
        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
            <div className="p-6 flex justify-center">
              <Loading />
            </div>
          </>
        ) : error || !job ? (
          <>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-red-600">Failed to load job details.</p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="px-10 py-6 border-b border-[#DCDCDC] sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold">Job Information</DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
              {/* General Info Section */}
              <div>
                <div className="px-8 py-3.5">
                  <h3 className="text-lg font-bold">General Info</h3>
                </div>

                <div className="px-10 space-y-3">
                  {/* Job Title */}
                  <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                    <span className="text-[#5D5D5D]">Job Title</span>
                    <span>{job.title}</span>
                  </div>

                  {/* Training Title */}
                  <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                    <span className="text-[#5D5D5D]">Description</span>
                    <span className="max-w-[280px] text-right">{job.description}</span>
                  </div>

                  {/* Number of Sessions */}
                  <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                    <span className="text-[#5D5D5D]">Number of Sessions</span>
                    <span>{job.numberOfSessions}</span>
                  </div>

                  {/* Date Posted */}
                  <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                    <span className="text-[#5D5D5D]">Date Posted</span>
                    <span>{format(new Date(job.createdAt), 'dd MMM yyyy')}</span>
                  </div>

                  {/* Deadline Date */}
                  <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                    <span className="text-[#5D5D5D]">Application Deadline</span>
                    <div className="text-right">
                      <div>{format(new Date(job.deadlineDate), 'dd MMM yyyy')}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(job.deadlineDate), 'h:mm a')}
                      </div>
                    </div>
                  </div>

                  {/* Applicants Required */}
                  <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                    <span className="text-[#5D5D5D]">Applicants Required</span>
                    <span>{job.applicantsRequired}</span>
                  </div>

                  {/* Status */}
                  <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                    <span className="text-[#5D5D5D]">Status</span>
                    <Badge 
                      variant={getStatusBadgeVariant(job.status)} 
                      className="capitalize"
                    >
                      {job.status?.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 