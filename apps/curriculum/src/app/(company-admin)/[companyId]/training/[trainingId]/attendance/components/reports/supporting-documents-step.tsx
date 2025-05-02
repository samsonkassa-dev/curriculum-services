"use client"

import { UseFormReturn } from "react-hook-form"
import { SessionReportFormValues } from "./session-report-schema"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { useState } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { X, Eye } from "lucide-react"
import { useBaseData } from "@/lib/hooks/useBaseData"

interface SupportingDocumentsStepProps {
  form: UseFormReturn<SessionReportFormValues>
}

export function SupportingDocumentsStep({ form }: SupportingDocumentsStepProps) {
  const { formState: { errors }, watch, setValue } = form
  const [selectedFileType, setSelectedFileType] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  const sessionReportFiles = watch("sessionReportFiles") || []
  
  // Fetch report file types from API
  const { data: reportFileTypes, isLoading } = useBaseData('report-file-type')

  const handleFileChange = (file: File | null) => {
    setError(null)
    
    if (!file) return

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and PDF files are allowed')
      return
    }

    if (file && selectedFileType) {
      const currentFiles = watch('sessionReportFiles') || []
      setValue('sessionReportFiles', [
        ...currentFiles,
        { reportFileTypeId: selectedFileType, file }
      ])
      
      // Reset the selected file type after upload
      setSelectedFileType("")
    } else {
      setError('Please select a file type before uploading')
    }
  }

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return '/fileC.svg'
  }

  const removeFile = (index: number) => {
    setValue('sessionReportFiles', sessionReportFiles.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get file type name by ID
  const getFileTypeName = (id: string) => {
    const fileType = reportFileTypes?.find((type: { id: string; name: string }) => type.id === id)
    return fileType?.name || "File"
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Select 
            onValueChange={(value) => setSelectedFileType(value)}
            value={selectedFileType}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full border border-[#E4E4E4]">
              <SelectValue placeholder="Select file type" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : reportFileTypes && reportFileTypes.length > 0 ? (
                reportFileTypes.map((type: { id: string; name: string }) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No file types available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <FileUpload
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {errors.sessionReportFiles && (
        <p className="text-sm text-red-500 mt-1">
          {errors.sessionReportFiles.message}
        </p>
      )}

      {/* Display uploaded files */}
      <div className="space-y-4 mt-6">
        {sessionReportFiles.length > 0 ? (
          sessionReportFiles.map((fileInfo, index) => {
            const fileTypeName = getFileTypeName(fileInfo.reportFileTypeId)
            
            return (
              <div 
                key={index} 
                className="flex items-center p-4 border border-[#DCDCDC] rounded-md"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-[#6C778B] rounded-full flex items-center justify-center">
                    <img 
                      src={getFilePreview(fileInfo.file)} 
                      alt="" 
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-medium">{fileInfo.file.name}</div>
                    <div className="text-xs text-[#5F5F5F]">
                      {formatDate(new Date())}
                    </div>
                    <div className="text-xs text-[#5F5F5F]">
                      {formatFileSize(fileInfo.file.size)}
                    </div>
                    <div className="text-xs text-[#0B75FF]">
                      {fileTypeName}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {fileInfo.file.type.startsWith('image/') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#0B75FF] border-[#0B75FF] hover:text-blue-700"
                      onClick={() => {
                        window.open(URL.createObjectURL(fileInfo.file), '_blank')
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-gray-500 py-8">
            No files uploaded yet. Select a file type and upload a document.
          </div>
        )}
      </div>
    </div>
  )
} 