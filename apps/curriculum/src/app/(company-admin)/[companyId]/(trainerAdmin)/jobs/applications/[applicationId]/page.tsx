"use client"

import { useApplication, useAcceptApplication, useRejectApplication, Application } from "@/lib/hooks/useApplication"
import { useParams, useRouter } from "next/navigation"
import { useState, useCallback, useMemo } from "react"
import { Loader2, Calendar, ChevronLeftIcon } from "lucide-react"
import { createApplicantColumns } from "../../components/applicant-columns"
import { ApplicantDataTable } from "../../components/applicant-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatDateToDisplay } from "@/lib/utils"

// Extract utility functions outside component to prevent recreation
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Extract components for better separation of concerns
function JobDetailsCard({ application }: { application: Application }) {
  const statusColor = useMemo(() => {
    if (application.status === "ACCEPTED") return "bg-green-100 text-green-800"
    if (application.status === "REJECTED") return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }, [application.status])

  const dotColor = useMemo(() => {
    if (application.status === "ACCEPTED") return "bg-green-600"
    if (application.status === "REJECTED") return "bg-red-600"
    return "bg-yellow-600"
  }, [application.status])

  return (
    <div className="bg-[#FBFBFB] p-5 rounded-lg border border-[#EAECF0]">
      <div className="flex flex-wrap justify-between items-center gap-x-10 gap-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-[#525252] font-bold text-xs">Job title</span>
          <div className="flex flex-col gap-1 min-w-[150px]">
            <h3 className="text-[#525252] font-bold text-sm">{application.job.title}</h3>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[#525252] font-bold text-xs">Date Posted</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[#565555]" />
            <span className="text-[#555252] font-light text-sm">
              {formatDate(application.job.createdAt)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[#525252] font-bold text-xs">Date Closed</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[#565555]" />
            <span className="text-[#555252] font-light text-sm">
              {formatDate(application.job.deadlineDate)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[#525252] font-bold text-xs">Job Status</span>
          <div 
            className={`flex items-center gap-1.5 py-0.5 px-2 rounded-2xl ${statusColor}`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></div>
            <span className="text-xs font-medium capitalize">
              {application.job.status.toLowerCase()}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[#525252] font-bold text-xs">Application Status</span>
          <div 
            className={`flex items-center gap-1.5 py-0.5 px-2 rounded-2xl ${statusColor}`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></div>
            <span className="text-xs font-medium capitalize">
              {application.status.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplicantsSection({ application, onOpenModal }: { application: Application, onOpenModal: () => void }) {
  const columns = useMemo(() => createApplicantColumns(onOpenModal), [onOpenModal])
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-medium">Applicants</h2>
      </div>

      <ApplicantDataTable
        columns={columns}
        data={[application]}
        isLoading={false}
      />
    </div>
  )
}

function TrainerInfoModal({ 
  application, 
  isOpen, 
  onClose, 
  onAccept, 
  onReject, 
  isUpdating 
}: {
  application: Application
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  onReject: (reason: string) => void
  isUpdating: boolean
}) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleReject = useCallback(() => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason)
      setRejectionReason("")
      setShowRejectForm(false)
    }
  }, [rejectionReason, onReject])

  const handleCancel = useCallback(() => {
    setRejectionReason("")
    setShowRejectForm(false)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Trainer Information</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6">
          {/* Trainer profile section */}
          <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
            <div className="h-16 w-16 rounded-full bg-blue-400 bg-opacity-60 flex items-center justify-center text-white text-xl font-medium">
              {getInitials(application.trainer.firstName, application.trainer.lastName)}
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-medium">
                {application.trainer.firstName} {application.trainer.lastName}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 border-0 font-medium capitalize">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-green-600" />
                  Available
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Trainer details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">General Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-b border-gray-200 py-2">
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium">{application.trainer.email}</p>
              </div>
              
              <div className="border-b border-gray-200 py-2">
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="font-medium">{application.trainer.phoneNumber}</p>
              </div>
              
              <div className="border-b border-gray-200 py-2">
                <p className="text-gray-500 text-sm">Gender</p>
                <p className="font-medium">{application.trainer.gender || 'Not specified'}</p>
              </div>
              
              <div className="border-b border-gray-200 py-2">
                <p className="text-gray-500 text-sm">Experience</p>
                <p className="font-medium">{application.trainer.experienceYears} years</p>
              </div>
              
              <div className="border-b border-gray-200 py-2">
                <p className="text-gray-500 text-sm">Location</p>
                <p className="font-medium">
                  {application.trainer.city?.name}, {application.trainer.zone?.name}
                </p>
              </div>
              
              <div className="border-b border-gray-200 py-2">
                <p className="text-gray-500 text-sm">Academic Level</p>
                <p className="font-medium">{application.trainer.academicLevel?.name || 'Not specified'}</p>
              </div>
              <div className="border-b border-gray-200 py-2">
                <p className="text-gray-500 text-sm">Application Type</p>
                <Badge 
                  variant="secondary"
                  className={`capitalize ${
                    application.applicationType === "MAIN" 
                      ? "border-blue-600 text-blue-600 bg-blue-50" 
                      : "border-gray-600 text-gray-600 bg-gray-50"
                  }`}
                >
                  {application.applicationType.toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Application status section - Only show for pending applications */}
          {application.status === "PENDING" && (
            <div className="space-y-4">
              {/* Rejection reason input */}
              {showRejectForm && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-4">
                {!showRejectForm ? (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isUpdating}
                    >
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={onAccept}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Accept
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="text-gray-500"
                      onClick={handleCancel}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={handleReject}
                      disabled={isUpdating || !rejectionReason.trim()}
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Confirm Rejection
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ApplicationDetailPage() {
  const params = useParams<{ applicationId: string, companyId: string }>()
  const router = useRouter()
  const applicationId = params.applicationId
  const companyId = params.companyId
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Fetch application details
  const { data, isLoading } = useApplication(applicationId)
  const { acceptApplication } = useAcceptApplication()
  const { rejectApplication } = useRejectApplication()
  
  const handleBack = useCallback(() => {
    router.push(`/${companyId}/jobs`)
  }, [router, companyId])
  
  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])
  
  const handleAccept = useCallback(() => {
    if (!applicationId) return
    
    setIsUpdating(true)
    acceptApplication(applicationId, {
      onSettled: () => {
        setIsUpdating(false)
        setIsModalOpen(false)
      }
    })
  }, [applicationId, acceptApplication])

  const handleReject = useCallback((reason: string) => {
    if (!applicationId) return
    
    setIsUpdating(true)
    rejectApplication(
      { applicationId, reason },
      {
        onSettled: () => {
          setIsUpdating(false)
          setIsModalOpen(false)
        }
      }
    )
  }, [applicationId, rejectApplication])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }
  
  if (!data?.application) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <p className="text-gray-500">Application not found</p>
      </div>
    )
  }

  const { application } = data

  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-10 md:pl-12 min-w-0">
      
        <div className="flex items-center gap-2 mb-8">
          <Button 
            onClick={handleBack}
            variant="ghost" 
            className="p-0 hover:bg-transparent"
          >
            <ChevronLeftIcon className="h-5 w-5 text-blue-500" />
          </Button>
          <h1 className="text-xl font-semibold">Application Details</h1>
        </div>
    
        <div className="flex flex-col py-4 gap-9">
          <JobDetailsCard application={application} />
          <ApplicantsSection application={application} onOpenModal={handleOpenModal} />
        </div>
      </div>

      <TrainerInfoModal
        application={application}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAccept={handleAccept}
        onReject={handleReject}
        isUpdating={isUpdating}
      />
    </div>
  )
} 