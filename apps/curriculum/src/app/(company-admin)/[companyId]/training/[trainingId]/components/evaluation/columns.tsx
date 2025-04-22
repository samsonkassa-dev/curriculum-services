"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// TODO: Replace with actual evaluation form type
interface EvaluationForm {
  id: string
  title: string
  description: string
  createdAt: string
  status: 'draft' | 'published'
  responses: number
}

export const columns: ColumnDef<EvaluationForm>[] = [
  {
    accessorKey: "title",
    header: "Form Title",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="max-w-[300px] truncate" title={description}>
          {description}
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className={`capitalize ${
          status === 'published' ? 'text-green-600' : 'text-gray-500'
        }`}>
          {status}
        </div>
      )
    }
  },
  {
    accessorKey: "responses",
    header: "Responses",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return date.toLocaleDateString()
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const form = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('View', form.id)}>
              View Form
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit', form.id)}>
              Edit Form
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log('Delete', form.id)}
              className="text-red-600"
            >
              Delete Form
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 