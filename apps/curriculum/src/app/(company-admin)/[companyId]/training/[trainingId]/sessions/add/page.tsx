"use client"

import { useParams, useRouter } from "next/navigation"
import { SessionForm } from "../components/session-form"
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { CustomDialogContent } from "../components/custom-dialog-content"

export default function AddSessionPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string
  const trainingId = params.trainingId as string
  
  const handleSuccess = () => {
    router.push(`/${companyId}/training/${trainingId}?tab=sessions`)
  }
  
  const handleCancel = () => {
    router.back()
  }
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && router.back()}>
      <CustomDialogContent 
        className="sm:max-w-[600px] max-h-[90vh] p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-semibold">New Session</DialogTitle>
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <SessionForm 
          trainingId={trainingId}
          companyId={companyId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </CustomDialogContent>
    </Dialog>
  )
} 