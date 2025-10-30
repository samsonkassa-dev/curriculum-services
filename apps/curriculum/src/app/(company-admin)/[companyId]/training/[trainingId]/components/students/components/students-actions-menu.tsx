"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Settings, FileCheck, GraduationCap, UserPlus, Award, Trash2, Plus, Upload } from "lucide-react"

interface StudentsActionsMenuProps {
  // Student management
  onAddStudent: () => void
  onShowImport: () => void
  
  // Sync permissions
  hasSyncPermission: boolean
  
  // Selected students sync handlers (require selection)
  selectedCount: number
  onSyncPreAssessment: () => void
  onSyncPostAssessment: () => void
  onSyncEnrollTrainees: () => void
  onSyncCreateTrainees: () => void
  isSyncingPreAssessment: boolean
  isSyncingPostAssessment: boolean
  isSyncingEnrollTrainees: boolean
  isSyncingCreateTrainees: boolean
  
  // Training-level sync handlers (don't require selection)
  onSyncPreAssessmentTraining: () => void
  onSyncPostAssessmentTraining: () => void
  onSyncEnrollTraineesTraining: () => void
  onSyncCreateTraineesTraining: () => void
  isSyncingPreAssessmentTraining: boolean
  isSyncingPostAssessmentTraining: boolean
  isSyncingEnrollTraineesTraining: boolean
  isSyncingCreateTraineesTraining: boolean
  
  // Bulk actions (require selection)
  hasEditPermission: boolean
  isCompanyAdmin: boolean
  isProjectManager: boolean
  onGenerateCertificates: () => void
  onBulkDelete: () => void
  isGeneratingCertificates: boolean
  isBulkDeleting: boolean
}

export function StudentsActionsMenu({
  onAddStudent,
  onShowImport,
  hasSyncPermission,
  selectedCount,
  onSyncPreAssessment,
  onSyncPostAssessment,
  onSyncEnrollTrainees,
  onSyncCreateTrainees,
  isSyncingPreAssessment,
  isSyncingPostAssessment,
  isSyncingEnrollTrainees,
  isSyncingCreateTrainees,
  onSyncPreAssessmentTraining,
  onSyncPostAssessmentTraining,
  onSyncEnrollTraineesTraining,
  onSyncCreateTraineesTraining,
  isSyncingPreAssessmentTraining,
  isSyncingPostAssessmentTraining,
  isSyncingEnrollTraineesTraining,
  isSyncingCreateTraineesTraining,
  hasEditPermission,
  isCompanyAdmin,
  isProjectManager,
  onGenerateCertificates,
  onBulkDelete,
  isGeneratingCertificates,
  isBulkDeleting,
}: StudentsActionsMenuProps) {
  if (!hasEditPermission && !hasSyncPermission) {
    return null
  }

  const hasSelection = selectedCount > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Settings className="h-4 w-4" />
          <span>Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Student Management Section */}
        {hasEditPermission && (
          <>
            <DropdownMenuLabel>Student Management</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={onAddStudent}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Add Student</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onShowImport}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Upload className="h-4 w-4 text-blue-600" />
              <span>Import CSV</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Sync Section - Selected Students */}
        {hasSyncPermission && hasSelection && (
          <>
            <DropdownMenuLabel>Sync Selected ({selectedCount})</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={onSyncPreAssessment}
              disabled={isSyncingPreAssessment}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isSyncingPreAssessment ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Syncing Pre-Assessment...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 text-blue-600" />
                  <span>Sync Pre-Assessment</span>
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={onSyncPostAssessment}
              disabled={isSyncingPostAssessment}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isSyncingPostAssessment ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Syncing Post-Assessment...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 text-blue-600" />
                  <span>Sync Post-Assessment</span>
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={onSyncEnrollTrainees}
              disabled={isSyncingEnrollTrainees}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isSyncingEnrollTrainees ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Syncing Enrollment...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span>Sync Enrollment</span>
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={onSyncCreateTrainees}
              disabled={isSyncingCreateTrainees}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isSyncingCreateTrainees ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Syncing Create Trainees...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <span>Sync Create Trainees</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Sync Section - All Students */}
        {hasSyncPermission && (
          <>
            <DropdownMenuLabel>Sync All Students</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={onSyncPreAssessmentTraining}
              disabled={isSyncingPreAssessmentTraining}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isSyncingPreAssessmentTraining ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Syncing Pre-Assessment...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 text-blue-600" />
                  <span>Sync Pre-Assessment</span>
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={onSyncPostAssessmentTraining}
              disabled={isSyncingPostAssessmentTraining}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isSyncingPostAssessmentTraining ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Syncing Post-Assessment...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 text-blue-600" />
                  <span>Sync Post-Assessment</span>
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={onSyncEnrollTraineesTraining}
              disabled={isSyncingEnrollTraineesTraining}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isSyncingEnrollTraineesTraining ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Syncing Enrollment...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span>Sync Enrollment</span>
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={onSyncCreateTraineesTraining}
              disabled={isSyncingCreateTraineesTraining}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isSyncingCreateTraineesTraining ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Syncing Created Trainees...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <span>Sync Created Trainees</span>
                </>
              )}
            </DropdownMenuItem>
            {hasEditPermission && hasSelection && <DropdownMenuSeparator />}
          </>
        )}
        
        {/* Bulk Actions - Only show when students are selected */}
        {hasEditPermission && hasSelection && (
          <>
            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
            
            {/* Generate Certificate */}
            {(isCompanyAdmin || isProjectManager) && selectedCount <= 10 && (
              <DropdownMenuItem
                onClick={onGenerateCertificates}
                disabled={isGeneratingCertificates}
                className="flex items-center gap-2 cursor-pointer"
              >
                {isGeneratingCertificates ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>Generating Certificates...</span>
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 text-green-600" />
                    <span>Generate Certificate{selectedCount > 1 ? 's' : ''}</span>
                  </>
                )}
              </DropdownMenuItem>
            )}
            
            {/* Delete */}
            {selectedCount > 1 && (
              <DropdownMenuItem
                onClick={onBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
              >
                {isBulkDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete {selectedCount} Students</span>
                  </>
                )}
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
