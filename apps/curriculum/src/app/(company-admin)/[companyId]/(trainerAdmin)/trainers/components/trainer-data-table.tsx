/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Trainer, useDeleteTrainer, Language, AcademicLevel, TrainingTag } from "@/lib/hooks/useTrainers"
import { createColumns } from "./columns"
import { TrainerDetailsModal } from "./trainer-details-modal"

interface DataTableProps {
  data: Trainer[]
  isLoading?: boolean
  pagination?: {
    totalPages: number
    currentPage: number
    setPage: (page: number) => void
    pageSize: number
    setPageSize: (size: number) => void
    totalElements: number
  }
  languages: Language[]
  academicLevels: AcademicLevel[]
  trainingTags: TrainingTag[]
}

export function TrainerDataTable({
  data,
  isLoading,
  pagination,
  languages,
  academicLevels,
  trainingTags,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [selectedTrainer, setSelectedTrainer] = React.useState<Trainer | null>(null)
  const [modalMode, setModalMode] = React.useState<"view" | "edit">("view")
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const { deleteTrainer, isLoading: isDeleting } = useDeleteTrainer()

  const handleViewTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEditTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleDeleteTrainer = async (trainer: Trainer) => {
    if (window.confirm(`Are you sure you want to delete ${trainer.firstName} ${trainer.lastName}?`)) {
      try {
        await deleteTrainer(trainer.id)
      } catch (error) {
        console.error("Error deleting trainer:", error)
      }
    }
  }

  const columns = React.useMemo(
    () => createColumns(handleViewTrainer, handleEditTrainer, handleDeleteTrainer),
    [handleViewTrainer, handleEditTrainer, handleDeleteTrainer]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
  })

  React.useEffect(() => {
    if (pagination) {
      table.setPageSize(pagination.pageSize)
    }
  }, [pagination?.pageSize, table])

  const startRecord = pagination?.totalElements ?? 0 > 0
    ? ((pagination?.currentPage ?? 1) - 1) * (pagination?.pageSize ?? 10) + 1
    : 0;
  const endRecord = Math.min(
    (pagination?.currentPage ?? 1) * (pagination?.pageSize ?? 10),
    pagination?.totalElements ?? 0
  );
  const showingText = pagination?.totalElements ?? 0 > 0
    ? `Showing ${startRecord} to ${endRecord} out of ${pagination?.totalElements} records`
    : "No records to show";

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-gray-200 bg-white overflow-hidden relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50 border-b border-gray-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id} 
                      colSpan={header.colSpan}
                      className="py-3 px-4 text-sm font-medium text-gray-500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4 text-sm text-gray-700">
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 0 && (
         <div className="flex items-center justify-between py-4">
           <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="md:text-sm text-xs text-gray-500">Showing</span>
                <Select
                  value={`${pagination.pageSize}`}
                  onValueChange={(value) => {
                    pagination.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px] bg-white border rounded-md md:text-sm text-xs md:px-2 px-2 py-1">
                    <SelectValue placeholder={pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 50].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs md:text-sm pl-2 text-gray-500">
                {showingText}
              </div>

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
      )}

      {selectedTrainer && (
        <TrainerDetailsModal
          trainer={selectedTrainer}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTrainer(null)
          }}
          mode={modalMode}
          languages={languages}
          academicLevels={academicLevels}
          trainingTags={trainingTags}
        />
      )}
    </div>
  )
} 