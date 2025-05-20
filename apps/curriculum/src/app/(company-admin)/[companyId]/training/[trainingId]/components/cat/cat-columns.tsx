"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Assessment } from "../cat"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export const assessmentColumns: ColumnDef<Assessment>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      const assessment = row.original
      return (
        <div className="font-medium text-gray-900">{assessment.name}</div>
      )
    }
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description
      // Truncate long descriptions
      const truncatedDesc = description.length > 60 
        ? description.substring(0, 60) + "..." 
        : description
        
      return <span className="text-gray-500">{truncatedDesc}</span>
    }
  },
  {
    accessorKey: "assessmentType.name",
    header: "Type",
    cell: ({ row }) => {
      const assessmentTypeName = row.original.assessmentType?.name || "N/A"
      
      return (
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
            bg-blue-50 text-blue-700`}>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{assessmentTypeName}</span>
          </div>
        </div>
      )
    }
  },
  {
    id: "level",
    header: "Level",
    cell: ({ row }) => {
      const assessment = row.original
      const level = assessment.assessmentLevel
      
      let bgColor = "bg-blue-50"
      let textColor = "text-blue-700"
      let dotColor = "bg-blue-500"
      
      if (level === "MODULE") {
        bgColor = "bg-green-50"
        textColor = "text-green-700"
        dotColor = "bg-green-500"
      } else if (level === "LESSON") {
        bgColor = "bg-amber-50"
        textColor = "text-amber-700"
        dotColor = "bg-amber-500"
      }
      
      return (
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
            ${bgColor} ${textColor}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            <span>{level}</span>
          </div>
        </div>
      )
    }
  },
  {
    id: "parent",
    header: "Belongs To",
    cell: ({ row }) => {
      const assessment = row.original
      let parentName = assessment.trainingTitle || "N/A"
      
      if (assessment.assessmentLevel === "MODULE" && assessment.moduleName) {
        parentName = assessment.moduleName
      } else if (assessment.assessmentLevel === "LESSON" && assessment.lessonName) {
        parentName = assessment.lessonName
      }
      
      return <span className="text-gray-500">{parentName}</span>
    }
  }
]

// Creates the actions column with passed-in handler functions
export const createActionsColumn = (
  handleEditAssessment: (assessment: Assessment) => void,
  handleDeleteAssessment: (assessment: Assessment) => void,
  hasEditPermission: boolean
): ColumnDef<Assessment> => ({
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const assessment = row.original
    
    if (!hasEditPermission) {
      return null
    }
    
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleEditAssessment(assessment)}
          className="h-8 w-8 p-0"
          title="Edit"
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleDeleteAssessment(assessment)}
          className="h-8 w-8 p-0"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    )
  }
}) 