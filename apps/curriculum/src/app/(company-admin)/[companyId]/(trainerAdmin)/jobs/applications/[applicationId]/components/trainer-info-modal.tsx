"use client"

import { Application } from "@/lib/hooks/useApplication"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface TrainerInfoModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  application: Application
  onAccept: () => void
  onReject: (reason: string) => void
  isUpdating: boolean
}

export default function TrainerInfoModal({
  isOpen,
  onOpenChange,
  application,
  onAccept,
  onReject,
  isUpdating
}: TrainerInfoModalProps) {
  const [rejectionReason, setRejectionReason] = useState("")

  // Helper function to generate avatar fallback from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Mock rating - in real application this would come from the API
  const rating = Math.floor(Math.random() * 5) + 1

  // Star rating component
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

  const handleReject = () => {
    onReject(rejectionReason)
    setRejectionReason("")
  }

  const handleCancel = () => {
    setRejectionReason("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                <StarRating rating={rating} />
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
              
              <div className="border-b border-gray-200 py-2">
                <p className="text-gray-500 text-sm">Language</p>
                <p className="font-medium">{application.trainer.language?.name || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          {/* Application status section - Only show for pending applications */}
          {application.status === "PENDING" && (
            <div className="space-y-4">
              {/* Rejection reason input - Only show when rejection button is clicked */}
              {rejectionReason !== "" && (
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
                {rejectionReason === "" ? (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => setRejectionReason(" ")}
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