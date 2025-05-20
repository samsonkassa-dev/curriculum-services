"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, Loader2 } from "lucide-react"
import { TrainingAssessment } from "@/lib/hooks/useTrainingAssessment"

interface CatDataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  pagination: {
    totalPages: number
    currentPage: number
    setPage: (page: number) => void
    pageSize: number
    setPageSize: (pageSize: number) => void
    totalElements: number
  }
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
}

export function AssessmentDataTable({
  columns,
  data,
  isLoading,
  pagination,
  rowSelection = {},
  onRowSelectionChange,
}: CatDataTableProps<TrainingAssessment>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: onRowSelectionChange,
  })

  // Calculate showing range for display
  const startRecord = pagination.currentPage > 0 
    ? ((pagination.currentPage - 1) * pagination.pageSize) + 1 
    : 0
  const endRecord = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalElements)
  const showingText = pagination.totalElements > 0
    ? `Showing ${startRecord} to ${endRecord} out of ${pagination.totalElements} records`
    : "No records to show"

  return (
    <div>
      <div className="rounded-md border border-gray-200 bg-white overflow-hidden relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="py-4 px-5 text-sm font-medium text-gray-500 bg-gray-50"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data && data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-5 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No assessments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center justify-between w-full">
          {/* Left side - Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="md:text-sm text-xs text-gray-500">Showing</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.setPageSize(Number(e.target.value))}
              className="border rounded-md md:text-sm text-xs md:px-2 px-2 py-1 bg-white"
              title="Page Size"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Center - Showing Text */}
          <div className="text-xs md:text-sm pl-2 text-gray-500">
            {showingText}
          </div>

          {/* Right side - Pagination Controls */}
          <div className="flex gap-1">
            <Button
              variant="pagination"
              size="sm"
              onClick={() =>
                pagination.setPage(Math.max(1, pagination.currentPage - 1))
              }
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                // Logic to show pagination numbers centered around current page
                let pageNumber;
                if (pagination.totalPages <= 5) {
                  // If we have 5 or fewer pages, show all
                  pageNumber = i + 1;
                } else {
                  // For more pages, center around current page
                  const middle = 2;
                  const currentPage = pagination.currentPage;
                  const start = Math.max(1, currentPage - middle);
                  const end = Math.min(pagination.totalPages, start + 4);
                  
                  // Adjust start if we're near the end
                  const adjustedStart = end === pagination.totalPages 
                    ? Math.max(1, end - 4) 
                    : start;
                  
                  pageNumber = adjustedStart + i;
                }
                
                // Don't render if the page number exceeds total pages
                if (pageNumber > pagination.totalPages) return null;
                
                return (
                  <Button
                    key={pageNumber}
                    variant="outline"
                    className={pagination.currentPage === pageNumber ? "border-brand text-brand" : ""}
                    size="sm"
                    onClick={() => pagination.setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              }
            ).filter(Boolean)}
            <Button
              variant="pagination"
              size="sm"
              onClick={() => pagination.setPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              <ChevronRightIcon className="md:w-4 md:h-4 w-2 h-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 