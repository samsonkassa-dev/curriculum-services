"use client"

import { ColumnDef } from "@tanstack/react-table"
import { IndividualUser } from "@/types/users"
import { Badge } from "@/components/ui/badge"
import { IndividualActionCell } from "./individual-action-cell"


export const individualColumns: ColumnDef<IndividualUser>[] = [
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => {
      const initials = row.getValue<string>("fullName")
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
      
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
          <span className="font-medium">{row.getValue("fullName")}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("status").toLowerCase()
      return (
        <Badge variant={status as "active" | "deactivated"}>
          {row.getValue<string>("status")}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: IndividualActionCell
  }
]

