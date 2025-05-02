"use client"

import { Download, ExternalLink, Award, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Certificate } from "@/lib/hooks/useCertificate"

interface CertificateCardProps {
  certificate: Certificate
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  // Choose a gradient based on the certificate id
  const getGradient = () => {
    const id = certificate.id || "";
    const hashCode = id.split("").reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    const gradients = [
      "from-blue-500 to-blue-700",
      "from-purple-500 to-indigo-600",
      "from-teal-400 to-teal-600",
      "from-green-500 to-emerald-600",
      "from-pink-500 to-rose-600",
      "from-orange-400 to-amber-600"
    ];
    
    return gradients[Math.abs(hashCode) % gradients.length];
  };

  return (
    <Card className="overflow-hidden border-[#EAECF0] hover:shadow-lg transition-all duration-300">
      <div className="p-0">
        <div className={`bg-gradient-to-r ${getGradient()} p-5 text-white relative`}>
          <div className="absolute top-0 right-0 opacity-10">
            <Award className="h-24 w-24 -mt-6 -mr-6" />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold truncate text-lg">
                {certificate.issuingOrganization}
              </h3>
              <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Completed: {formatDate(certificate.completionDate)}
              </p>
            </div>
            <Badge className="bg-white/90 text-blue-800 hover:bg-white">
              {certificate.grade > 0 ? `Grade: ${certificate.grade}` : "Certificate"}
            </Badge>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          {certificate.trainee && (
            <div className="space-y-1">
              <p className="text-gray-500 text-xs font-medium">STUDENT</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-medium shadow-sm">
                  {certificate.trainee.firstName?.[0]}{certificate.trainee.lastName?.[0]}
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    {certificate.trainee.firstName} {certificate.trainee.lastName}
                  </p>
                  <p className="text-gray-500 text-sm">{certificate.trainee.email}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-gray-500 text-xs font-medium">ISSUED DATE</p>
            <p className="text-gray-900 flex items-center gap-2">
              <span className="text-blue-600"><Clock size={14} /></span>
              {formatDate(certificate.issueDate)}
            </p>
          </div>
          
          {certificate.description && (
            <div className="space-y-1">
              <p className="text-gray-500 text-xs font-medium">DESCRIPTION</p>
              <p className="text-gray-700 text-sm line-clamp-2">{certificate.description}</p>
            </div>
          )}
          
          {certificate.creditHours > 0 && (
            <div className="space-y-1">
              <p className="text-gray-500 text-xs font-medium">CREDIT HOURS</p>
              <p className="text-gray-900 flex items-center gap-2">
                <span className="text-blue-600"><BookOpen size={14} /></span>
                {certificate.creditHours}
              </p>
            </div>
          )}

          {certificate.fileUrl && (
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-gray-100">
              <a 
                href={certificate.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 text-sm flex items-center gap-1 hover:underline hover:text-blue-700 transition-colors"
              >
                <ExternalLink size={14} />
                View Certificate
              </a>
              <a 
                href={certificate.fileUrl} 
                download 
                className="text-blue-600 text-sm flex items-center gap-1 hover:underline hover:text-blue-700 transition-colors"
              >
                <Download size={14} />
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
} 