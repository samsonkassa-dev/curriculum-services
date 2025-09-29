"use client"

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

interface AssessmentApproveDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  assessmentName: string
  isApproving: boolean
}

export function AssessmentApproveDialog({
  isOpen,
  onClose,
  onConfirm,
  assessmentName,
  isApproving
}: AssessmentApproveDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Assessment</AlertDialogTitle>
          <AlertDialogDescription>
            You're about to approve the assessment <span className="font-semibold">&quot;{assessmentName}&quot;</span>.
            Make sure you've reviewed its questions using the View action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isApproving}
            className="bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white"
          >
            {isApproving ? "Approving..." : "Approve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


