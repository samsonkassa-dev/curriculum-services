
"use client"

import { useMemo } from "react"
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
import { EvaluationSummary } from "@/lib/hooks/evaluation-types"

interface PaginationProps {
  currentPage: number
  totalPages: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (size: number) => void
  totalElements: number
}

interface EvaluationDataTableProps {
  columns: ColumnDef<EvaluationSummary>[]
  data: EvaluationSummary[]
  isLoading?: boolean
  pagination?: PaginationProps
}

export function EvaluationDataTable({
  columns,
  data,
  isLoading = false,
  pagination
}: EvaluationDataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Calculate showing text
  const showingText = useMemo(() => {
    if (!pagination) return "No records to show"
    
    const { currentPage, pageSize, totalElements } = pagination
    
    if (totalElements === 0) return "No records to show"
    
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalElements)
    
    return `Showing ${startItem} to ${endItem} out of ${totalElements} records`
  }, [pagination])

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
                    <ChevronLeftIcon className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data && data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-5 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                  No evaluations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination - Simplified for now, can be expanded later */}
      {pagination && (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rows per page</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.setPageSize(Number(e.target.value))}
                className="border rounded-md text-sm px-2 py-1 bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              {showingText}
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.setPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.setPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
        </div>
      )}
    </div>
  )
}

