'use client'

import React from 'react'
import { useSessionTrainers, Trainer } from '@/lib/hooks/useSession'
import { Loading } from '@/components/ui/loading'
import { 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Tag 
} from 'lucide-react'

interface TrainerDetailsTabProps {
  sessionId: string
  trainerType: 'MAIN' | 'ASSISTANT'
}

// Helper component for detail items
const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => {
  if (!value) return null // Don't render if value is missing
  
  // Handle case where value is a complex React node (like for tags)
  const isComplex = React.isValidElement(value)
  
  return (
    <div className="flex items-start gap-3">
      <div className="bg-blue-50 p-2 rounded-md">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {isComplex ? (
          value
        ) : (
          <p className="text-sm text-gray-800 font-medium">{value}</p>
        )}
      </div>
    </div>
  )
}

export function TrainerDetailsTab({ sessionId, trainerType }: TrainerDetailsTabProps) {
  const { data: trainers, isLoading, error } = useSessionTrainers(sessionId, trainerType)

  const title = trainerType === 'MAIN' ? 'Main Trainer' : 'Assistant Trainer'

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-red-600">
        <AlertCircle className="h-10 w-10 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading {title} Details</h3>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  if (!trainers || trainers.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500">No {title} assigned to this session yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {trainers.map((trainer: Trainer) => (
        <div 
          key={trainer.id} 
          className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* Header section */}
          <div className="flex items-center gap-4 p-6 border-b border-gray-100">
            {/* Placeholder for image/icon */}
            <div className="bg-blue-100 p-4 rounded-full">
              <User className="h-7 w-7 text-blue-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {trainer.firstName} {trainer.lastName}
              </h3>
              <p className="text-sm text-blue-600 font-medium">{title}</p> 
            </div>
          </div>

          {/* Details section */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DetailItem 
                icon={Mail}
                label="Email"
                value={trainer.email || 'N/A'}
              />
              <DetailItem 
                icon={Phone}
                label="Phone Number"
                value={trainer.phoneNumber || 'N/A'}
              />
              <DetailItem 
                icon={Briefcase}
                label="Experience Years"
                value={trainer.experienceYears !== undefined ? `${trainer.experienceYears} Year(s)` : 'N/A'}
              />
              <DetailItem 
                icon={GraduationCap}
                label="Academic Level"
                value={trainer.academicLevel?.name || 'N/A'}
              />
            </div>
            
            {/* Training Tags - Full width */}
            {(trainer.trainingTags && trainer.trainingTags.length > 0) && (
              <div className="pt-4 border-t border-gray-100">
                <DetailItem 
                  icon={Tag}
                  label="Expertise / Tags"
                  value={
                    <div className="text-sm text-gray-800 font-medium">
                      <div className="flex flex-wrap gap-2 mt-2">
                        {trainer.trainingTags.map((tag: { id: string; name: string }) => (
                          <span 
                            key={tag.id} 
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 