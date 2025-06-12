"use client"

import * as React from "react"
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
import { Loading } from "@/components/ui/loading"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface DataTablePaginationProps {
  totalPages: number
  currentPage: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (pageSize: number) => void
  totalElements: number
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
  pagination: DataTablePaginationProps
}

export function JobDataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  pagination
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: {
        pageIndex: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      },
    },
    manualPagination: true,
    pageCount: pagination.totalPages,
  })

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
        <div className="overflow-x-auto">
          <Table className="min-w-full">
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
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className="border-gray-100"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="py-4 px-5 text-sm"
                      >
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
                    No jobs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center justify-between w-full">
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
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="text-xs md:text-sm pl-2 text-gray-500">
            {showingText}
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.setPage(Math.max(1, pagination.currentPage - 1))
              }
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from(
              { length: Math.min(5, Math.max(1, pagination.totalPages)) },
              (_, i) => {
                let pageNumber;
                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1;
                } else {
                  const middle = 2;
                  const currentPage = pagination.currentPage;
                  const start = Math.max(1, currentPage - middle);
                  const end = Math.min(pagination.totalPages, start + 4);
                  const adjustedStart = end === pagination.totalPages 
                    ? Math.max(1, end - 4) 
                    : start;
                  pageNumber = adjustedStart + i;
                }
                
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
              variant="outline"
              size="sm"
              onClick={() => pagination.setPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 