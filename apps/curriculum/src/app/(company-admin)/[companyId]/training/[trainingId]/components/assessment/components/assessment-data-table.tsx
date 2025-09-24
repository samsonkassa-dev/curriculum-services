"use client"

import { useState, useMemo } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { AssessmentSummary } from "@/lib/hooks/useAssessment"

interface PaginationProps {
  currentPage: number
  totalPages: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (size: number) => void
  totalElements: number
}

interface AssessmentDataTableProps {
  columns: ColumnDef<AssessmentSummary>[]
  data: AssessmentSummary[]
  isLoading?: boolean
  pagination?: PaginationProps
}

export function AssessmentDataTable({
  columns,
  data,
  isLoading = false,
  pagination
}: AssessmentDataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Calculate pagination range
  const paginationRange = useMemo(() => {
    if (!pagination) return []
    
    const { currentPage, totalPages } = pagination
    const range = []
    const maxVisiblePages = 5
    
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const end = Math.min(totalPages, start + maxVisiblePages - 1)
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    
    return range
  }, [pagination])

  // Calculate showing text
  const showingText = useMemo(() => {
    if (!pagination || data.length === 0) return ""
    
    const { currentPage, pageSize, totalElements } = pagination
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalElements)
    
    return `Showing ${startItem} to ${endItem} out of ${totalElements} records`
  }, [pagination, data.length])

  if (isLoading) {
    return (
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-gray-50">
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
              {/* Loading skeleton rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {pagination && (
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="md:text-sm text-xs text-gray-500">Showing</span>
                <div className="border rounded-md md:text-sm text-xs md:px-2 px-2 py-1 bg-gray-200 animate-pulse w-12 h-6" />
              </div>
              <div className="text-xs md:text-sm pl-2 text-gray-400">Loading...</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled>1</Button>
                <Button variant="outline" size="sm" disabled>
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-gray-50">
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
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-500 text-sm">No assessments found</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-gray-50">
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
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-gray-50/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && (
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
                variant="outline"
                size="sm"
                onClick={() =>
                  pagination.setPage(Math.max(1, pagination.currentPage - 1))
                }
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              {paginationRange.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant="outline"
                  className={pagination.currentPage === pageNumber ? "border-blue-600 text-blue-600" : ""}
                  size="sm"
                  onClick={() => pagination.setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.setPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ChevronRightIcon className="md:w-4 md:h-4 w-2 h-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
