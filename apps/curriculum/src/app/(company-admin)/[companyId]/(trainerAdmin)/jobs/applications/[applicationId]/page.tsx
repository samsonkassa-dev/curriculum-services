"use client"

import { useApplication, useAcceptApplication, useRejectApplication } from "@/lib/hooks/useApplication"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Filter } from "@/components/ui/filter"
import Image from "next/image"
import { useState } from "react"
import { Loader2, ChevronDownIcon, EyeIcon, Calendar, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ApplicationDetailPage() {
  const params = useParams<{ applicationId: string, companyId: string }>()
  const router = useRouter()
  const applicationId = params.applicationId
  const companyId = params.companyId
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  
  // Fetch application details
  const { data, isLoading } = useApplication(applicationId)
  const { acceptApplication, isLoading: isAccepting } = useAcceptApplication()
  const { rejectApplication, isLoading: isRejecting } = useRejectApplication()
  
  const handleBack = () => {
    router.push(`/${companyId}/jobs`)
  }
  
  const handleUpdateStatus = (newStatus: "ACCEPTED" | "REJECTED") => {
    if (!applicationId) return
    
    setIsUpdating(true)
    
    if (newStatus === "ACCEPTED") {
      acceptApplication(applicationId, {
        onSettled: () => {
          setIsUpdating(false)
          setIsModalOpen(false)
        }
      })
    } else if (newStatus === "REJECTED") {
      rejectApplication(
        { applicationId, reason: rejectionReason },
        {
          onSettled: () => {
            setIsUpdating(false)
            setIsModalOpen(false)
            setRejectionReason("")
          }
        }
      )
    }
  }
  
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Set color based on status
  let statusColor = "bg-yellow-100 text-yellow-800"
  if (application.status === "ACCEPTED") {
    statusColor = "bg-green-100 text-green-800"
  } else if (application.status === "REJECTED") {
    statusColor = "bg-red-100 text-red-800"
  }
  
  // Set dot color based on status
  const dotColor = application.status === "ACCEPTED" 
    ? "bg-green-600" 
    : application.status === "REJECTED" 
      ? "bg-red-600" 
      : "bg-yellow-600"

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

  // Pagination mock data (for UI display only)
  const pagination = {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    setPage: (_page: number) => {},
    setPageSize: (_size: number) => {}
  }
  
  const showingText = "Showing 1 to 1 out of 1 records";

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
          {/* Job Details Card - Updated to match session UI tab-like structure */}
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

          {/* Applicants Section - Removed table borders from header */}
          <div className="rounded-lg bg-white overflow-hidden">
            {/* Header with search and filters */}
            <div className="flex items-center justify-between py-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-medium">Applicants</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative md:w-[300px]">
                  <Image
                    src="/search.svg"
                    alt="Search"
                    width={19}
                    height={19}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5 z-10"
                  />
                  <Input
                    placeholder="Search applicants..."
                    className="pl-10 h-10 bg-white border-gray-200 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Filter
                  statusOptions={[
                    { id: 'PENDING', label: 'Pending' },
                    { id: 'ACCEPTED', label: 'Accepted' },
                    { id: 'REJECTED', label: 'Rejected' },
                  ]}
                  onApply={() => {}}
                  defaultSelected={{}}
                />
              </div>
            </div>

            {/* Table according to Figma design */}
            <div className="border border-gray-200 rounded-b-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="py-4 px-5 text-sm font-medium text-gray-500 bg-gray-50">
                      <div className="flex items-center gap-1">
                        Full Name
                        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    </TableHead>
                    <TableHead className="py-4 px-5 text-sm font-medium text-gray-500 bg-gray-50">
                      <div className="flex items-center gap-1">
                        Email
                        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    </TableHead>
                    <TableHead className="py-4 px-5 text-sm font-medium text-gray-500 bg-gray-50">
                      <div className="flex items-center gap-1">
                        Rating
                        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    </TableHead>
                    <TableHead className="py-4 px-5 text-sm font-medium text-gray-500 bg-gray-50">
                      <div className="flex items-center gap-1">
                        Application Status
                        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    </TableHead>
                    <TableHead className="py-4 px-5 text-sm font-medium text-gray-500 bg-gray-50" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-gray-100">
                    <TableCell className="py-4 px-5 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-400 bg-opacity-60 flex items-center justify-center text-white text-sm font-medium">
                          {getInitials(application.trainer.firstName, application.trainer.lastName)}
                        </div>
                        <span className="font-normal">
                          {application.trainer.firstName} {application.trainer.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-sm">
                      {application.trainer.email}
                    </TableCell>
                    <TableCell className="py-4 px-5 text-sm">
                      <StarRating rating={rating} />
                    </TableCell>
                    <TableCell className="py-4 px-5 text-sm">
                      <Badge className={`${statusColor} border-0 font-medium capitalize`}>
                        <span className={`mr-1.5 h-2 w-2 rounded-full ${dotColor}`} />
                        {application.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-sm">
                      <div className="flex items-center justify-center">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-blue-500"
                          onClick={() => setIsModalOpen(true)}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Updated Pagination to match job-data-table */}
              <div className="flex items-center justify-between py-4 px-4 bg-gray-50">
                <div className="flex items-center justify-between w-full">
                  {/* Left side - Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <span className="md:text-sm text-xs text-gray-500">Showing</span>
                    <select
                      value={pagination.pageSize}
                      onChange={(e) => pagination.setPageSize(Number(e.target.value))}
                      className="border rounded-md md:text-sm text-xs md:px-2 px-2 py-1 bg-white"
                      title="Page Size"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Center - Showing Text */}
                  <div className="text-xs md:text-sm pl-2 text-gray-500">
                    {showingText}
                  </div>

                  {/* Right side - Pagination Controls */}
                  <div className="flex gap-1">
                    <Button
                      variant="pagination"
                      size="sm"
                      onClick={() => pagination.setPage(Math.max(1, pagination.currentPage - 1))}
                      disabled={pagination.currentPage <= 1}
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border-brand text-brand"
                      size="sm"
                      onClick={() => pagination.setPage(1)}
                    >
                      1
                    </Button>
                    <Button
                      variant="pagination"
                      size="sm"
                      onClick={() => pagination.setPage(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                    >
                      <ChevronRightIcon className="md:w-4 md:h-4 w-2 h-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trainer Information Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                  <p className="font-medium">{application.trainer.location || 'Not provided'}</p>
                </div>
                
                <div className="border-b border-gray-200 py-2">
                  <p className="text-gray-500 text-sm">Academic Level</p>
                  <p className="font-medium">{application.trainer.academicLevel?.name || 'Not specified'}</p>
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
                        onClick={() => handleUpdateStatus("ACCEPTED")}
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
                        onClick={() => setRejectionReason("")}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => handleUpdateStatus("REJECTED")}
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
    </div>
  )
} 