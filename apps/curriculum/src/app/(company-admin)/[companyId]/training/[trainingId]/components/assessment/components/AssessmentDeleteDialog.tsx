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

interface AssessmentDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  assessmentName: string
  isDeleting: boolean
}

export function AssessmentDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  assessmentName,
  isDeleting
}: AssessmentDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the assessment <span className="font-semibold">&quot;{assessmentName}&quot;</span>? 
            This action cannot be undone and will remove all questions and responses associated with this assessment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Assessment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
