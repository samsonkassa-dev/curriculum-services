"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeactivateModalProps {
  isOpen: boolean
  onClose: () => void
  onDeactivate: () => void
}

export function DeactivateModal({ isOpen, onClose, onDeactivate }: DeactivateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[330px]">
        <DialogHeader className="text-center">
          <div className="mx-auto bg-[#ffeaea] rounded-full border border-[#D03710] w-12 h-12 mb-4 flex items-center justify-center">
            <img src="/delete.svg" alt="Delete icon" className="w-4 h-4 md:w-6 md:h-6"/>
          </div>
          <DialogTitle className="text-lg font-semibold text-center">
            Are you sure you want to Deactivate this User?
          </DialogTitle>
          <DialogDescription className="text-center text-[#292827] md:text-sm text-xs">
            Please click the button below in order to proceed with user deactivation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-4 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-8 text-[#9C9791]"
          >
            Cancel
          </Button>
          <Button
            onClick={onDeactivate}
            variant="outline"
            className="px-8 text-[#D03710] border-[#D03710] hover:bg-red-600 hover:text-white"
          >
            Deactivate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 