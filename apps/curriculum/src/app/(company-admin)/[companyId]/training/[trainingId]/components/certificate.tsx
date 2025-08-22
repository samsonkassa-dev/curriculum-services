"use client"

import { useState, useMemo } from "react"
import { useGetCertificates, Certificate } from "@/lib/hooks/useCertificate"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { PlusCircle, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { CreateCertificateModal } from "./certificate/create-certificate-modal"
import { CertificateCard } from "./certificate/certificate-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CertificateComponentProps {
  trainingId: string
}

export function CertificateComponent({ trainingId }: CertificateComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1) // Start from page 1
  const [pageSize, setPageSize] = useState(6) // Default to 6 certificates per page
  
  // Fetch certificates for this training with pagination
  const { 
    data: certificatesData, 
    isLoading, 
    error 
  } = useGetCertificates(
    trainingId,
    { page, pageSize }
  )
  
  const certificates = certificatesData?.certificates || []
  const totalPages = certificatesData?.totalPages || 1
  const currentPage = certificatesData?.currentPage || 1 // Assuming API returns 1-based index
  const totalElements = certificatesData?.totalElements || 0

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPage(prev => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setPage(prev => prev - 1)
    }
  }
  
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setPage(1) // Reset to first page when changing page size
  }
  
  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = []
    const maxPagesToShow = 5 // Show at most 5 numbered pages
    
    if (totalPages <= maxPagesToShow) {
      // If we have few pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // For many pages, show current page with some neighbors and ellipses
      
      // Always include first page
      pages.push(1)
      
      // Calculate range around current page
      const leftBound = Math.max(2, currentPage - 1)
      const rightBound = Math.min(totalPages - 1, currentPage + 1)
      
      // Add ellipsis if needed
      if (leftBound > 2) {
        pages.push(-1) // Use -1 to represent ellipsis
      }
      
      // Add pages around current page
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i)
      }
      
      // Add ellipsis if needed
      if (rightBound < totalPages - 1) {
        pages.push(-2) // Use -2 to represent ellipsis
      }
      
      // Always include last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }, [totalPages, currentPage])

  const headerSection = (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-xl font-semibold">Certificates</h1>
        {totalElements > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {totalElements} certificate{totalElements !== 1 ? 's' : ''} total
          </p>
        )}
      </div>
      
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <PlusCircle size={16} />
        Create Certificate
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}

        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border border-[#EAECF0]">
          <h3 className="text-lg font-medium mb-2">Error Loading Certificates</h3>
          <p className="text-gray-500 text-sm">
            There was a problem loading the certificates. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}

        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border border-[#EAECF0]">
          <h3 className="text-lg font-medium mb-2">No Certificates Created</h3>
          <p className="text-gray-500 text-sm">
            No certificates have been created for this training program yet.
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Certificate
          </Button>
        </div>
        
        {/* Certificate creation modal */}
        <CreateCertificateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          trainingId={trainingId}
        />
      </div>
    )
  }

  return (
    <div className="px-[7%] py-10">
      {headerSection}
      
      {/* Certificate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate: Certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </div>
      
      {/* Enhanced Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 pt-6 border-t border-gray-100 gap-4">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>Showing {certificates.length} of {totalElements} certificates</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 per page</SelectItem>
                <SelectItem value="12">12 per page</SelectItem>
                <SelectItem value="24">24 per page</SelectItem>
                <SelectItem value="48">48 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page numbers */}
            {pageNumbers.map((pageNum, index) => {
              if (pageNum < 0) {
                // Render ellipsis
                return (
                  <div 
                    key={`ellipsis-${index}`} 
                    className="h-8 w-8 flex items-center justify-center"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </div>
                )
              }
              
              return (
                <Button
                  key={`page-${pageNum}`}
                  onClick={() => setPage(pageNum)}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                >
                  {pageNum}
                </Button>
              )
            })}
            
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Certificate creation modal */}
      <CreateCertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trainingId={trainingId}
      />
    </div>
  )
}
