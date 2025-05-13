import { useState, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VenueWizard } from "./venue-wizard"
import { Venue } from "@/lib/hooks/useVenue"

interface VenueDialogProps {
  companyId: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  venue?: Venue | null
  onClose?: () => void
}

export const AddVenueDialog = memo(function AddVenueDialog({ 
  companyId, 
  trigger, 
  onSuccess, 
  venue, 
  onClose 
}: VenueDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const isEditMode = !!venue

  // Open dialog when venue is provided (for edit mode)
  useEffect(() => {
    if (venue) {
      setOpen(true)
    }
  }, [venue])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen && onClose) {
      onClose()
    }
  }

  const handleSuccess = () => {
    handleOpenChange(false)
    if (onSuccess) {
      onSuccess()
    } else {
      router.refresh()
    }
  }

  const handleCancel = () => {
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Venue</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-5">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-semibold">
              {isEditMode ? 'Edit Venue' : 'Add New Venue'}
            </DialogTitle>
          </div>
        </DialogHeader>
        <VenueWizard 
          companyId={companyId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          venue={venue}
        />
      </DialogContent>
    </Dialog>
  )
}) 