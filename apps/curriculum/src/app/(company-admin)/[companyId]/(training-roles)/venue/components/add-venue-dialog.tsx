import { useState } from "react"
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
import { VenueWizard } from "./venue-wizard" // Import wizard

interface AddVenueDialogProps {
  companyId: string
  trigger?: React.ReactNode
  onSuccess?: () => void // Optional success callback
}

export function AddVenueDialog({ companyId, trigger, onSuccess }: AddVenueDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    if (onSuccess) {
      onSuccess()
    } else {
      router.refresh()
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Venue</Button>}
      </DialogTrigger>
      {/* Increased width for multi-step form */}
      <DialogContent className="sm:max-w-[800px]  p-5"> 
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between w-full">
            {/* Title might change based on step later */}
            <DialogTitle className="text-xl font-semibold">Add New Venue</DialogTitle> 
            
          </div>
        </DialogHeader>
        {/* Replace placeholder with the actual wizard component */}
        <VenueWizard 
          companyId={companyId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
} 