"use client"

import { useParams } from "next/navigation"
import { useGetCertificateById } from "@/lib/hooks/useCertificate"
import { Loading } from "@/components/ui/loading"
import { CheckCircle2, XCircle, Download, Calendar, User, Phone, BookOpen, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export default function CertificateViewPage() {
  const params = useParams()
  const certificateId = params?.id as string

  const { data, isLoading, error } = useGetCertificateById(certificateId)

  // Loading state
  if (isLoading) {
    return <Loading />
  }

  // Error state
  if (error || !data || data.code !== "OK") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Certificate Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The certificate you are looking for does not exist or has been removed.
          </p>
          <p className="text-sm text-gray-500">
            Certificate ID: {certificateId}
          </p>
        </div>
      </div>
    )
  }

  const { certificate } = data

  // Success state - Certificate found
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Valid Certificate
                </h1>
                <p className="text-sm text-gray-600">
                  This certificate is authentic and verified
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.open(certificate.fileUrl, '_blank')}
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificate Details Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#0B75FF] to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Certificate Details
            </h2>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Trainee Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#0B75FF]" />
                  Trainee Information
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {certificate.traineeName}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact Phone</label>
                    <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {certificate.traineeContactPhone}
                    </p>
                  </div>

           
                </div>
              </div>  

              {/* Training Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0B75FF]" />
                  Training Information
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Training Title</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {certificate.trainingTitle}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Issue Date</label>
                    <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {format(new Date(certificate.issueDate), 'MMMM dd, yyyy')}
                    </p>
                  </div>

         
                </div>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Certificate ID</label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">
                    {certificate.id}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Verified & Authentic</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Certificate Preview
            </h2>
          </div>

          <div className="p-4 md:p-8">
            {/* PDF Preview - Using object tag for both mobile and desktop */}
            <div className="aspect-[1.414/1] w-full rounded-lg overflow-hidden shadow-inner relative bg-gray-100">
              <object
                data={certificate.fileUrl}
                type="application/pdf"
                className="w-full h-full"
                aria-label="Certificate PDF Preview"
              >
                {/* Fallback for browsers that can't display PDF - keep it simple */}
                <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    PDF Preview Unavailable
                  </p>
                  <p className="text-sm text-gray-600">
                    Your browser cannot display this PDF inline.
                  </p>
                </div>
              </object>
            </div>
            
            {/* Download button - single source of truth */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = certificate.fileUrl
                  link.download = `certificate-${certificate.id}.pdf`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                size="lg"
                className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white w-full md:w-auto"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Certificate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}