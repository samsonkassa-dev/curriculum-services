"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Student } from "@/lib/hooks/useStudents" // Assuming this is the correct type
import { Checkbox } from "@/components/ui/checkbox"
// Remove Avatar imports as component is missing
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Define columns for the modal student selection table
export const modalStudentColumns: ColumnDef<Student>[] = [
  // Selection Column
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
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
          {/* Avatar removed */}
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
  // Status Column (Optional - based on Figma)
  // Assuming 'status' field exists on Student type, adjust if needed
  {
    accessorKey: "status", 
    header: "Status",
    cell: ({ row }) => {
      // const isActive = row.original.status === "ACTIVE" // Commented out: status does not exist on Student type
      const isActive = true; // Placeholder: Assume active for now, or remove column if status unavailable
      return (
        <Badge variant={isActive ? "active" : "deactivated"}> {/* Use valid variants */}
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  // NOTE: Figma shows a '...' column, omitting for now unless specific actions are needed here.
] 