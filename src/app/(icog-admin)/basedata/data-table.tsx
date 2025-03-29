/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
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
import { Loader2, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Constants
const PAGE_SIZES = [5, 10, 20, 30, 50];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onUpdate?: (id: string, data: { 
    name: string; 
    description: string;
    countryId?: string;
    range?: string;
    technologicalRequirementType?: string;
    assessmentSubType?: string;
  }) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
  newItemId?: string
  activeTab: string
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  }
}

// Add PaginationControls component
function PaginationControls({ pagination }: { 
  pagination: DataTableProps<any, any>["pagination"]
}) {
  // Calculate showing info
  const startRecord = pagination.totalItems > 0 
    ? (pagination.currentPage - 1) * pagination.pageSize + 1 
    : 0;
  
  const endRecord = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalItems
  );

  const showingText = pagination.totalItems > 0
    ? `Showing ${startRecord} to ${endRecord} out of ${pagination.totalItems} records`
    : "No records found";

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left side - Page Size Selector */}
      <div className="flex items-center gap-2">
        <span className="md:text-sm text-xs text-gray-500">Showing</span>
        <select
          value={pagination.pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            pagination.onPageSizeChange(newSize);
          }}
          className="border rounded-md md:text-sm text-xs px-2 py-1 bg-white"
          title="Page Size"
        >
          {PAGE_SIZES.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {/* Center - Showing Text */}
      <div className="md:text-sm text-xs pl-2 text-gray-500">
        {showingText}
      </div>

      {/* Right side - Pagination Controls */}
      <div className="flex gap-1">
        <Button
          variant="pagination"
          size="sm"
          onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <div className="flex gap-1">
          {pagination.totalPages <= 7 ? (
            // Display all pages if less than 7
            Array.from({ length: pagination.totalPages }, (_, i) => (
              <Button
                key={i}
                variant={pagination.currentPage === i + 1 ? "outline" : "outline"}
                className={pagination.currentPage === i + 1 ? "border-brand text-brand" : ""}
                size="sm"
                onClick={() => pagination.onPageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))
          ) : (
            // Display pagination with ellipsis for many pages
            <>
              {/* First page */}
              <Button
                variant={pagination.currentPage === 1 ? "outline" : "outline"}
                className={pagination.currentPage === 1 ? "border-brand text-brand" : ""}
                size="sm"
                onClick={() => pagination.onPageChange(1)}
              >
                1
              </Button>
              
              {/* Ellipsis for beginning */}
              {pagination.currentPage > 3 && (
                <span className="px-2 flex items-center">...</span>
              )}
              
              {/* Pages around current page */}
              {Array.from(
                { length: Math.min(3, pagination.totalPages) },
                (_, i) => {
                  const pageNum = Math.max(
                    2,
                    pagination.currentPage - 1 + i - (pagination.currentPage > pagination.totalPages - 2 ? 2 : 0)
                  );
                  
                  if (pageNum >= pagination.totalPages) return null;
                  if (pageNum <= 1) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? "outline" : "outline"}
                      className={pagination.currentPage === pageNum ? "border-brand text-brand" : ""}
                      size="sm"
                      onClick={() => pagination.onPageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
              
              {/* Ellipsis for end */}
              {pagination.currentPage < pagination.totalPages - 2 && (
                <span className="px-2 flex items-center">...</span>
              )}
              
              {/* Last page */}
              {pagination.totalPages > 1 && (
                <Button
                  variant={pagination.currentPage === pagination.totalPages ? "outline" : "outline"}
                  className={pagination.currentPage === pagination.totalPages ? "border-brand text-brand" : ""}
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.totalPages)}
                >
                  {pagination.totalPages}
                </Button>
              )}
            </>
          )}
        </div>
        <Button
          variant="pagination"
          size="sm"
          onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
        >
          <ChevronRightIcon className="md:w-4 md:h-4 w-2 h-2" />
        </Button>
      </div>
    </div>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  newItemId,
  pagination,
  onUpdate,
  onDelete,
  activeTab,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    state: {
      sorting,
      pagination: {
        pageIndex: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      }
    },
  })

  return (
    <div>
      <div className="rounded-md border border-gray-200 bg-white overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-600 px-5">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-gray-100 transition-colors",
                    (row.original as any).id === newItemId && "bg-blue-50"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="pl-5">
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
                  {isLoading ? "" : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <PaginationControls pagination={pagination} />
      </div>
    </div>
  )
} 