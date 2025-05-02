"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Student } from "@/lib/hooks/useStudents"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CircleIcon } from "lucide-react"

// Define columns for the modal student selection table
export const modalStudentColumns: ColumnDef<Student>[] = [
  // Selection Column
  {
    id: "select",
    header: () => null, // No header for selection column
    cell: ({ row }) => (
      <div className="flex items-center justify-center px-1">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // Full Name Column
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => {
      const student = row.original
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim()
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-400 bg-opacity-60 flex items-center justify-center text-white text-sm font-medium">
            {student.firstName?.[0]}{student.lastName?.[0]}
          </div>
          <span className="font-medium truncate">{fullName || "Unnamed Student"}</span>
        </div>
      )
    }
  },
  // Email Column
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="truncate">{row.original.email || "-"}</div>,
  },
  // Status Column
  {
    accessorKey: "status", 
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge variant="active">Active</Badge>
      )
    },
  },
] 