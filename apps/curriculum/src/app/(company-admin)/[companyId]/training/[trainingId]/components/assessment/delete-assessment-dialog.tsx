"use client"

import { TrainingAssessment } from "@/lib/hooks/useTrainingAssessment"
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

interface DeleteCatAssessmentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  assessment: TrainingAssessment | null
  onConfirmDelete: () => Promise<void>
  isDeleting: boolean
}

export function DeleteAssessmentDialog({
  isOpen,
  onOpenChange,
  assessment,
  onConfirmDelete,
  isDeleting
}: DeleteCatAssessmentDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{assessment?.name}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault()
              await onConfirmDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 