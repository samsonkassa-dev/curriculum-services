"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

interface CSVStudentData {
  rowIndex: number
  firstName?: string
  lastName?: string
  errors?: Record<string, string>
}

interface CSVErrorSummaryProps {
  data: CSVStudentData[]
  onRemoveErrorRows?: () => void
}

export function CSVErrorSummary({ data, onRemoveErrorRows }: CSVErrorSummaryProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const hasErrors = data.some(row => row.errors && Object.keys(row.errors).length > 0)
  const errorRows = data.filter(row => row.errors && Object.keys(row.errors).length > 0)
  const errorCount = errorRows.length
  
  // Get total error count across all fields
  const totalErrorCount = errorRows.reduce((sum, row) => {
    return sum + (row.errors ? Object.keys(row.errors).length : 0)
  }, 0)

  if (!hasErrors) {
    return null
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h4 className="font-medium text-red-800">
              Validation Errors Found: {errorCount} {errorCount === 1 ? 'row' : 'rows'} ({totalErrorCount} {totalErrorCount === 1 ? 'error' : 'errors'})
            </h4>
          </div>
          <p className="text-sm text-red-600 mb-2">
            Please fix the highlighted errors before importing. Hover over the <AlertCircle className="h-3 w-3 inline text-red-500" /> icon to see error details, or click on any cell to edit.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-red-700 hover:text-red-800 hover:bg-red-100 p-0 h-auto font-normal"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide error details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show error details
              </>
            )}
          </Button>
        </div>
        {onRemoveErrorRows && (
          <Button 
            variant="outline" 
            onClick={onRemoveErrorRows}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 ml-4"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove All Error Rows
          </Button>
        )}
      </div>
      
      {showDetails && (
        <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
          {errorRows.map((row) => (
            <div key={row.rowIndex} className="bg-white border border-red-200 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-red-800 text-sm">
                  Row {row.rowIndex}
                  {row.firstName && row.lastName && (
                    <span className="text-gray-600 font-normal ml-2">
                      ({row.firstName} {row.lastName})
                    </span>
                  )}
                </span>
              </div>
              <ul className="space-y-1">
                {Object.entries(row.errors || {}).map(([field, error]) => (
                  <li key={field} className="text-xs text-red-700 flex items-start gap-2">
                    <span className="font-medium min-w-[120px] capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="flex-1">{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 