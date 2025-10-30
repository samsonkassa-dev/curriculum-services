"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Upload } from "lucide-react"
import Image from "next/image"
import { StudentFilter } from "../student-filter"
import { StudentFilters } from "@/lib/hooks/useStudents"
import { BaseDataItem } from "@/types/base-data"

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
          <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={onShowImport}
            >
              <Upload className="h-4 w-4" />
              <span>Import CSV</span>
            </Button>
            <Button
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
              onClick={onAddStudent}
            >
              <Plus className="h-4 w-4" />
              <span>Add Student</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

