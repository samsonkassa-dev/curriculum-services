"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useGetCertificates } from "@/lib/hooks/useCertificate"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { PlusCircle } from "lucide-react"

interface CertificateComponentProps {
  trainingId: string
}

export function CertificateComponent({ trainingId }: CertificateComponentProps) {
  const [isCreating, setIsCreating] = useState(false)
  
  // Fetch certificates for this training
  const { 
    data: certificatesData, 
    isLoading, 
    error 
  } = useGetCertificates(trainingId)
  
  const certificates = certificatesData?.certificates || []

  const headerSection = (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-xl font-semibold">Certificates</h1>
      
      <Button 
        onClick={() => setIsCreating(true)}
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
            onClick={() => setIsCreating(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Certificate
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-[7%] py-10">
      {headerSection}
      
      {/* Certificate content will go here */}
      <div className="bg-white rounded-lg border border-[#EAECF0] overflow-hidden">
        <div className="p-6">
          <p>Certificate list and management will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}
