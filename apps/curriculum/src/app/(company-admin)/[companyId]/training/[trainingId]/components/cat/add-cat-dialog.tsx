"use client"

import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CatForm } from "./cat-form"
import { useState } from "react"

interface AddCatDialogProps {
  trainingId: string
  companyId: string
  trigger?: React.ReactNode
}

export function AddCatDialog({ trainingId, companyId, trigger }: AddCatDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  
  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }
  
  const handleCancel = () => {
    setOpen(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add CAT</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-semibold">New CAT</DialogTitle>
          </div>
        </DialogHeader>
        <CatForm 
          trainingId={trainingId}
          companyId={companyId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
} 