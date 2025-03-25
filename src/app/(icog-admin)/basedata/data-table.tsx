/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
const DEFAULT_PAGE_SIZE = 5;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onUpdate?: (id: string, data: { name: string; description: string }) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
  newItemId?: string
  activeTab: string
}

// Add PaginationControls component
function PaginationControls({ table, data }: { table: any, data: any[] }) {
  return (
    <div className="flex items-center justify-between w-full">
      {/* Left side - Page Size Selector */}
      <div className="flex items-center gap-2">
        <span className="md:text-sm text-xs text-gray-500">Showing</span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
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
        Showing {table.getState().pagination.pageSize} out of {data.length} records
      </div>

      {/* Right side - Pagination Controls */}
      <div className="flex gap-1">
        <Button
          variant="pagination"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <div className="flex gap-1">
          {Array.from({ length: table.getPageCount() }, (_, i) => (
            <Button
              key={i}
              variant={table.getState().pagination.pageIndex === i ? "outline" : "outline"}
              className={table.getState().pagination.pageIndex === i ? "border-brand text-brand" : ""}
              size="sm"
              onClick={() => table.setPageIndex(i)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="pagination"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
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
  // activeTab,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: DEFAULT_PAGE_SIZE,
      },
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
        <PaginationControls table={table} data={data} />
      </div>
    </div>
  )
} 