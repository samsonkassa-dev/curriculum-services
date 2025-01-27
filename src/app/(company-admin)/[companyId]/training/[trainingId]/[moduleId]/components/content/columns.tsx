"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Content } from "@/lib/hooks/useContent"
import { Badge } from "@/components/ui/badge"
import { ContentActionCell } from "./content-action-cell"

export const columns: ColumnDef<Content>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "contentFor",
    header: "Content For",
    cell: ({ row }) => {
      const content = row.original
      return content.lessonName || content.sectionName || content.moduleName
    }
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "contentDeveloper",
    header: "Assigned To",
    cell: ({ row }) => row.original.contentDeveloper.email
  },
  {
    accessorKey: "contentFileType",
    header: "File Type",
  },
  {
    accessorKey: "link",
    header: "Content Link",
    cell: ({ row }) => (
      <span className="text-blue-500">
        {row.original.link ? (
          <a href={row.original.link} target="_blank" rel="noopener noreferrer">
            View Content
          </a>
        ) : (
          "Awaiting Link"
        )}
      </span>
    )
  },
  {
    accessorKey: "contentStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.contentStatus
      return (
        <Badge 
          variant={
            status === 'PENDING' ? 'pending' :
            status === 'APPROVED' ? 'accepted' :
            'rejected'
          }
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ContentActionCell
  }
] 