"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Award, Trash2 } from "lucide-react"
import Image from "next/image"
import { StudentFilter } from "../student-filter"
import { StudentFilters } from "@/lib/hooks/useStudents"
import { BaseDataItem } from "@/types/base-data"
import { StudentsActionsMenu } from "./students-actions-menu"

interface BaseDataResponse {
  data: BaseDataItem[]
  totalItems?: number
  totalPages?: number
  currentPage?: number
  pageSize?: number
}

// Types matching StudentFilter expectations
interface Country {
  id: string
  name: string
  description: string
}

interface Region {
  id: string
  name: string
  description: string
  country: Country
}

interface Zone {
  id: string
  name: string
  description: string
  region: Region
}

interface Language {
  id: string
  name: string
  description: string
}

interface AcademicLevel {
  id: string
  name: string
  description: string
}

interface StudentsHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  trainingId: string
  filters: StudentFilters
  onApplyFilters: (filters: StudentFilters) => void
  onAddStudent: () => void
  onShowImport: () => void
  csvCountries?: BaseDataResponse | null
  csvRegions?: BaseDataResponse | null
  csvZones?: BaseDataResponse | null
  languages?: BaseDataResponse | null
  academicLevels?: BaseDataResponse | null
  hasEditPermission: boolean
  hasSyncPermission: boolean
  selectedCount: number
  // Sync handlers for selected students
  onSyncPreAssessment: () => void
  onSyncPostAssessment: () => void
  onSyncEnrollTrainees: () => void
  onSyncCreateTrainees: () => void
  isSyncingPreAssessment: boolean
  isSyncingPostAssessment: boolean
  isSyncingEnrollTrainees: boolean
  isSyncingCreateTrainees: boolean
  // Sync handlers for all students
  onSyncPreAssessmentTraining: () => void
  onSyncPostAssessmentTraining: () => void
  onSyncEnrollTraineesTraining: () => void
  onSyncCreateTraineesTraining: () => void
  isSyncingPreAssessmentTraining: boolean
  isSyncingPostAssessmentTraining: boolean
  isSyncingEnrollTraineesTraining: boolean
  isSyncingCreateTraineesTraining: boolean
  // Bulk actions
  isCompanyAdmin: boolean
  isProjectManager: boolean
  onGenerateCertificates: () => void
  onBulkDelete: () => void
  isGeneratingCertificates: boolean
  isBulkDeleting: boolean
}

export function StudentsHeader({
  searchQuery,
  onSearchChange,
  trainingId,
  filters,
  onApplyFilters,
  onAddStudent,
  onShowImport,
  csvCountries,
  csvRegions,
  csvZones,
  languages,
  academicLevels,
  hasEditPermission,
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
  isCompanyAdmin,
  isProjectManager,
  onGenerateCertificates,
  onBulkDelete,
  isGeneratingCertificates,
  isBulkDeleting,
}: StudentsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <h1 className="text-lg font-semibold">Students</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-[280px] md:w-[300px]">
            <Image
              src="/search.svg"
              alt="Search"
              width={19}
              height={19}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5 z-10"
            />
            <Input
              placeholder="Search students..."
              className="pl-10 h-10 text-sm bg-white border-gray-200 w-full"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <StudentFilter
              trainingId={trainingId}
              countries={csvCountries?.data as Country[] | undefined}
              // Regions and zones from useBaseData don't have nested structure
              // StudentFilter will use cascaded data from useSingleCascadingLocation instead
              regions={undefined}
              zones={undefined}
              languages={languages?.data as Language[] | undefined}
              academicLevels={academicLevels?.data as AcademicLevel[] | undefined}
              onApply={onApplyFilters}
              defaultSelected={filters}
            />
          </div>
        </div>
        
        {hasEditPermission && (
          <div className="flex gap-2 w-full sm:w-auto sm:justify-end flex-wrap">
            {/* Bulk Actions - Show when students are selected */}
            {selectedCount > 0 && (
              <>
                {/* Generate Certificate */}
                {(isCompanyAdmin || isProjectManager) && selectedCount <= 10 && (
                  <Button
                    onClick={onGenerateCertificates}
                    disabled={isGeneratingCertificates}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isGeneratingCertificates ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4" />
                        <span>Generate Certificate{selectedCount > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </Button>
                )}
                
                {/* Delete */}
                {selectedCount > 1 && (
                  <Button
                    onClick={onBulkDelete}
                    disabled={isBulkDeleting}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    {isBulkDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete {selectedCount} Students</span>
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            
            <StudentsActionsMenu
              onAddStudent={onAddStudent}
              onShowImport={onShowImport}
              hasSyncPermission={hasSyncPermission}
              selectedCount={selectedCount}
              onSyncPreAssessment={onSyncPreAssessment}
              onSyncPostAssessment={onSyncPostAssessment}
              onSyncEnrollTrainees={onSyncEnrollTrainees}
              onSyncCreateTrainees={onSyncCreateTrainees}
              isSyncingPreAssessment={isSyncingPreAssessment}
              isSyncingPostAssessment={isSyncingPostAssessment}
              isSyncingEnrollTrainees={isSyncingEnrollTrainees}
              isSyncingCreateTrainees={isSyncingCreateTrainees}
              onSyncPreAssessmentTraining={onSyncPreAssessmentTraining}
              onSyncPostAssessmentTraining={onSyncPostAssessmentTraining}
              onSyncEnrollTraineesTraining={onSyncEnrollTraineesTraining}
              onSyncCreateTraineesTraining={onSyncCreateTraineesTraining}
              isSyncingPreAssessmentTraining={isSyncingPreAssessmentTraining}
              isSyncingPostAssessmentTraining={isSyncingPostAssessmentTraining}
              isSyncingEnrollTraineesTraining={isSyncingEnrollTraineesTraining}
              isSyncingCreateTraineesTraining={isSyncingCreateTraineesTraining}
              hasEditPermission={hasEditPermission}
            />
          </div>
        )}
      </div>
    </div>
  )
}

