"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface CSVStudentData {
  rowIndex: number
  errors?: Record<string, string>
}

interface CSVErrorSummaryProps {
  data: CSVStudentData[]
  onRemoveErrorRows?: () => void
}

export function CSVErrorSummary({ data, onRemoveErrorRows }: CSVErrorSummaryProps) {
  const hasErrors = data.some(row => row.errors && Object.keys(row.errors).length > 0)
  const errorCount = data.filter(row => row.errors && Object.keys(row.errors).length > 0).length

  if (!hasErrors) {
    return null
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-red-800 mb-2">Validation Errors Found ({errorCount} rows)</h4>
          <p className="text-sm text-red-600">
            Please fix the highlighted errors before importing. Click on any cell to edit.
          </p>
        </div>
        {onRemoveErrorRows && (
          <Button 
            variant="outline" 
            onClick={onRemoveErrorRows}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove All Error Rows
          </Button>
        )}
      </div>
    </div>
  )
} 