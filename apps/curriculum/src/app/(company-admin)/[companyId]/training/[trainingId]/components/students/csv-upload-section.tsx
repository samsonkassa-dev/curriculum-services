"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CSVUploadSectionProps {
  onFileSelect: (file: File) => void
}

export function CSVUploadSection({ onFileSelect }: CSVUploadSectionProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === "dragenter") {
      dragCounterRef.current++
      setDragActive(true)
    } else if (e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      dragCounterRef.current--
      if (dragCounterRef.current === 0) {
        setDragActive(false)
      }
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    dragCounterRef.current = 0
    
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

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          dragActive 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive ? (
          <FileText className="h-12 w-12 mx-auto text-blue-500 mb-4 animate-bounce" />
        ) : (
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        )}
        
        <h3 className={cn(
          "text-lg font-medium mb-2 transition-colors",
          dragActive ? "text-blue-700" : ""
        )}>
          {dragActive ? "Drop your CSV file here" : "Upload CSV File"}
        </h3>
        
        <p className={cn(
          "mb-4 transition-colors",
          dragActive ? "text-blue-600 text-sm" : "text-gray-500"
        )}>
          {dragActive 
            ? "Release to upload" 
            : "Drag and drop your CSV file here, or click to browse"
          }
        </p>
        
        {!dragActive && (
          <Button onClick={() => fileInputRef.current?.click()} className="text-white">
            Choose File
          </Button>
        )}
        
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