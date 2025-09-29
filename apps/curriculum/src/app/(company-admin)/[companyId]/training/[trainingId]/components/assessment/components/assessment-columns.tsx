"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Settings, Trash2, CheckCircle2, PlusCircle } from "lucide-react"
import { AssessmentSummary } from "@/lib/hooks/useAssessment"
import { Badge } from "@/components/ui/badge"

// Base assessment columns
export const assessmentColumns: ColumnDef<AssessmentSummary>[] = [
  {
    id: "assessmentType",
    header: "Assessment Type",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Badge 
            variant="pending"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            Pre and Post Training
          </Badge>
        </div>
      )
    }
  },
  {
    id: "description",
    header: "Description",
    cell: ({ row }) => {
      const assessment = row.original
      return (
        <div className="max-w-[300px]">
          <span className="text-gray-500">
            {assessment.description || "No description provided"}
          </span>
        </div>
      )
    }
  },
  {
    id: "assignedTo", 
    header: "Assigned To",
    cell: ({ row }) => {
      const assessment = row.original
      
      if (assessment.contentDeveloper) {
        const dev = assessment.contentDeveloper as unknown as {
          firstName: string | null
          lastName: string | null
          email: string
          role?: { name: string }
        }
        const displayName = (dev.firstName || dev.lastName)
          ? `${dev.firstName || ''} ${dev.lastName || ''}`.trim()
          : (dev.email?.split('@')[0] || 'Content Developer')
        const roleName = dev.role?.name === 'ROLE_CONTENT_DEVELOPER' ? 'Content Developer' : dev.role?.name || ''
        return (
          <div className="flex flex-col">
            <span className="text-gray-700 text-sm">{displayName}</span>
            <span className="text-gray-500 text-xs">{roleName}</span>
          </div>
        )
      }
      
      return (
        <span className="text-gray-500">
          Not assigned
        </span>
      )
    }
  },
  {
    id: "cohort",
    header: "Cohort", 
    cell: ({ row }) => {
      const assessment = row.original
      
      // Only show cohorts if they actually exist and are not empty
      if (assessment.cohorts && assessment.cohorts.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {assessment.cohorts.slice(0, 2).map((cohort, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {cohort.name}
              </Badge>
            ))}
            {assessment.cohorts.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{assessment.cohorts.length - 2} more
              </Badge>
            )}
          </div>
        )
      }
      
      // Show "Not assigned" when no cohorts exist (no dummy data)
      return (
        <span className="text-gray-500">
          Not assigned
        </span>
      )
    }
  },
  {
    id: "approvalStatus",
    header: "Approval Status",
    cell: ({ row }) => {
      const assessment = row.original
      const status = assessment.approvalStatus
      
      const statusConfig = {
        PENDING: {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        },
        APPROVED: {
          label: "Approved", 
          className: "bg-green-100 text-green-800 hover:bg-green-100"
        },
        REJECTED: {
          label: "Rejected",
          className: "bg-red-100 text-red-800 hover:bg-red-100"
        }
      }
      
      const config = statusConfig[status] || statusConfig.PENDING
      
      return (
        <Badge variant="secondary" className={config.className}>
          {config.label}
        </Badge>
      )
    }
  }
]

// Create actions column
export function createAssessmentActionsColumn(
  onView: (assessment: AssessmentSummary) => void,
  onEdit: (assessment: AssessmentSummary) => void,
  onSettings: (assessment: AssessmentSummary) => void,
  onDelete: (assessment: AssessmentSummary) => void,
  hasEditPermission: boolean,
  onApprove?: (assessment: AssessmentSummary) => void,
  canApprove?: (assessment: AssessmentSummary) => boolean,
  onAddContent?: (assessment: AssessmentSummary) => void,
  canAddContent?: (assessment: AssessmentSummary) => boolean
): ColumnDef<AssessmentSummary> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const assessment = row.original

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(assessment)}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="View Assessment"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {hasEditPermission && (
            <>
              {canAddContent?.(assessment) && onAddContent ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddContent(assessment)}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="Add Content"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(assessment)}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  title="Edit Assessment"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onApprove && canApprove?.(assessment) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApprove(assessment)}
                  className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  title="Approve Assessment"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
              
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={() => onSettings(assessment)}
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                title="Assessment Settings"
              >
                <Settings className="h-4 w-4" />
              </Button> */}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(assessment)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete Assessment"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  }
}

// Create columns with actions
export function createAssessmentColumnsWithActions(
  onView: (assessment: AssessmentSummary) => void,
  onEdit: (assessment: AssessmentSummary) => void,
  onSettings: (assessment: AssessmentSummary) => void,
  onDelete: (assessment: AssessmentSummary) => void,
  hasEditPermission: boolean,
  onApprove?: (assessment: AssessmentSummary) => void,
  canApprove?: (assessment: AssessmentSummary) => boolean,
  onAddContent?: (assessment: AssessmentSummary) => void,
  canAddContent?: (assessment: AssessmentSummary) => boolean
): ColumnDef<AssessmentSummary>[] {
  return [
    ...assessmentColumns,
    createAssessmentActionsColumn(
      onView,
      onEdit,
      onSettings,
      onDelete,
      hasEditPermission,
      onApprove,
      canApprove,
      onAddContent,
      canAddContent,
    )
  ]
}
