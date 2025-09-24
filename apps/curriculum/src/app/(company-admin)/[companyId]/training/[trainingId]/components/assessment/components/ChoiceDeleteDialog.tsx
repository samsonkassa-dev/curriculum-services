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

interface ChoiceDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  choiceText: string
  isDeleting: boolean
}

export function ChoiceDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  choiceText,
  isDeleting
}: ChoiceDeleteDialogProps) {
  const truncatedChoice = choiceText.length > 30 
    ? `${choiceText.substring(0, 30)}...` 
    : choiceText || "this choice"

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Choice</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">&quot;{truncatedChoice}&quot;</span>? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Choice"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
