import { Suspense } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SessionForm } from "./session-form"
import { useState } from "react"
import { Loading } from "@/components/ui/loading"

// Loading fallback for the form
const FormLoadingFallback = () => (
  <Loading/>
)

interface AddSessionDialogProps {
  trainingId: string
  companyId: string
  trigger?: React.ReactNode
}

export function AddSessionDialog({ trainingId, companyId, trigger }: AddSessionDialogProps) {
  const [open, setOpen] = useState(false)
  
  const handleSuccess = () => {
    setOpen(false)
  }
  
  const handleCancel = () => {
    setOpen(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Session</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 rounded-lg">
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Add Session
          </DialogTitle>
        </DialogHeader>
        
        {open && (
          <Suspense fallback={<FormLoadingFallback />}>
            <SessionForm 
              trainingId={trainingId}
              companyId={companyId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  )
} 