"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Trainer } from "@/lib/hooks/useTrainers" // Assuming Trainer type export
import { MoreHorizontal } from "lucide-react" // Icons for actions

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useParams } from "next/navigation"

interface ActionsProps {
  row: Row<Trainer>
  onView: (trainer: Trainer) => void
  onEdit: (trainer: Trainer) => void
  onDelete: (trainer: Trainer) => void
}

// Component for the Actions Cell
const ActionsCell = ({ row, onView, onEdit, onDelete }: ActionsProps) => {
  const trainer = row.original
  const params = useParams()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(trainer.email)}>
          Copy email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(trainer)}>
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(trainer)}>
          Edit trainer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete(trainer)}
          className="text-red-600"
        >
          Delete trainer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// You might want to add more columns based on the Figma design or requirements
export const createColumns = (
  onView: (trainer: Trainer) => void,
  onEdit: (trainer: Trainer) => void,
  onDelete: (trainer: Trainer) => void
): ColumnDef<Trainer>[] => [
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("firstName")}</div>,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
     cell: ({ row }) => <div className="capitalize">{row.getValue("lastName")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => <div>{row.getValue("phoneNumber")}</div>,
  },
  {
    accessorKey: "experienceYears",
    header: "Experience (Yrs)",
    cell: ({ row }) => <div className="text-center">{row.getValue("experienceYears")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <ActionsCell 
        row={row} 
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
] 