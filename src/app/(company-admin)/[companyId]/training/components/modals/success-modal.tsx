"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onAssignClick: () => void
}

export function SuccessModal({ isOpen, onClose, onAssignClick }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[350px]">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 mb-4">
            <img src="/modalRight.svg" alt="" />
          </div>
          <DialogTitle className="text-lg font-semibold text-center">Training Successfully Created</DialogTitle>
          <DialogDescription className="text-center">
            Please click the button below in order to proceed with curriculum creation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button
            onClick={onAssignClick}
            className=" text-brand border-[0.3px] border-brand"
            variant="outline"
          >
            <img src="/assignCurriculum.svg" alt="" className="mr-2" />
            Assign Curriculum Admin
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 