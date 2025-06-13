"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Venue } from "@/lib/hooks/useVenue"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, memo } from "react"

interface ActionsCellProps {
  venue: Venue
  onView: (venue: Venue) => void
  onEdit: (venue: Venue) => void
  onDelete: (venueId: string) => void
}

// Memoized Actions Cell Component
const ActionsCell = memo(function ActionsCell({ venue, onView, onEdit, onDelete }: ActionsCellProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView(venue)}
          className="h-8 px-3 text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(venue)}
          className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the venue &quot;{venue.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(venue.id)
                setShowDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

interface VenueColumnsProps {
  onView: (venue: Venue) => void
  onEdit: (venue: Venue) => void
  onDelete: (venueId: string) => void
}

export const createVenueColumns = ({ onView, onEdit, onDelete }: VenueColumnsProps): ColumnDef<Venue>[] => [
  {
    id: "venue",
    header: "Venues",
    cell: ({ row }) => {
      const venue = row.original
      
      // Get display name
      const name = venue.name || 'Unnamed Venue'

      // Get initials from the name
      const initials = name
        .split(' ')
        .map(n => n?.[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2)
      
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
          <span className="font-medium">{name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => row.original.location || "N/A"
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => row.original.city?.name || "N/A"
  },
  {
    accessorKey: "zone",
    header: "Zone",
    cell: ({ row }) => {
      const zone = row.original.zone
      if (!zone) return "No Zone Assigned"
      
      // Handle zone being either string or object
      const zoneName = typeof zone === 'string' ? zone : (zone as { name?: string })?.name || 'Unknown Zone';
      
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: '#DDEB9D' }} 
          />
          <span>{zoneName}</span>
        </div>
      )
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        venue={row.original}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
  }
] 