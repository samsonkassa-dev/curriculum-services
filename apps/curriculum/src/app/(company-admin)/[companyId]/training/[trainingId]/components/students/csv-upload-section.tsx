"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Papa from "papaparse"

interface CSVUploadSectionProps {
  onFileSelect: (file: File) => void
}

export function CSVUploadSection({ onFileSelect }: CSVUploadSectionProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        onFileSelect(file)
      } else {
        toast.error("Please upload a CSV file")
      }
    }
  }, [onFileSelect])

  const handleFileSelectInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        onFileSelect(file)
      } else {
        toast.error("Please upload a CSV file")
      }
    }
  }, [onFileSelect])

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        firstName: "John",
        middleName: "K.",
        lastName: "Doe",
        email: "john@example.com",
        contactPhone: "+251911223344",
        dateOfBirth: "1990-01-01",
        gender: "MALE",
        countryId: "sample-country-id",
        regionId: "sample-region-id", 
        zoneId: "sample-zone-id",
        cityId: "sample-city-id",
        subCity: "Sample SubCity",
        woreda: "Sample Woreda",
        houseNumber: "123A",
        languageId: "sample-language-id",
        academicLevelId: "sample-academic-level-id",
        fieldOfStudy: "Computer Science",
        hasSmartphone: "TRUE",
        smartphoneOwner: "Self",
        hasTrainingExperience: "TRUE",
        trainingExperienceDescription: "Taught at university",
        emergencyContactName: "Jane Doe",
        emergencyContactPhone: "+251912345678",
        emergencyContactRelationship: "Sister",
        hasDisability: "FALSE",
        belongsToMarginalizedGroup: "FALSE",
        disabilityIds: "",
        marginalizedGroupIds: ""
      }
    ]
    
    const csv = Papa.unparse(sampleData)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_sample.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
        <p className="text-gray-500 mb-4">
          Drag and drop your CSV file here, or click to browse
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => fileInputRef.current?.click()} className="text-white">
            Choose File
          </Button>
          {/* <Button variant="outline" onClick={downloadSampleCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Sample
          </Button> */}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelectInput}
          className="hidden"
          aria-label="Upload CSV file"
        />
      </div>
    </div>
  )
} 