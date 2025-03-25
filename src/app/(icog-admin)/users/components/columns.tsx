"use client"

import { ColumnDef } from "@tanstack/react-table"
import { IndividualUser, CompanyFilesType } from "@/types/users"
import { Badge } from "@/components/ui/badge"
import { IndividualActionCell } from "./individual-action-cell"
import { CompanyActionCell } from "./company-action-cell"

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
          <div className="w-8 h-5 md:w-9 md:h-9 rounded-full bg-[#6dacff] text-white flex items-center justify-center md:text-sm text-xs font-medium">
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
    accessorKey: "deactivated",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.deactivated
      return (
        <Badge variant={status ? "deactivated" : "active"}>
          {status ? "Deactivated" : "Active"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role?.name || 'N/A';
      return (
        <span className="capitalize">
          {role.replace('ROLE_', '').replace(/_/g, ' ').toLowerCase()}
        </span>
      )
    }
  },
  // {
  //   accessorKey: "createdAt",
  //   header: "Created at",
  // },
  {
    id: "actions",
    cell: IndividualActionCell
  }
]

export const companyColumns: ColumnDef<CompanyFilesType>[] = [
  {
    accessorKey: "name",
    header: "Company Name",
    cell: ({ row }) => {
      const name = row.original.name
 
      
      return (
        <div className="flex items-center gap-3">
          {/* <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
            {firstLetter}
          </div> */}
          <span className="font-medium">{name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "businessType",
    header: "Business Type",
    cell: ({ row }) => row.original.businessType.name
  },
  {
    accessorKey: "countryOfIncorporation",
    header: "Country",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "verificationStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.verificationStatus.toLowerCase()
      const variant = {
        accepted: 'accepted',
        pending: 'pending',
        rejected: 'rejected'
      }[status] as 'accepted' | 'pending' | 'rejected'

      return (
        <Badge variant={variant}>
          {row.original.verificationStatus}
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created at",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },
  {
    id: "actions",
    cell: CompanyActionCell
  }
] 