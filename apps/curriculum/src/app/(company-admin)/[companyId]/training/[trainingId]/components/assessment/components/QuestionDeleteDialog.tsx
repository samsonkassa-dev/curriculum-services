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

interface QuestionDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  questionText: string
  isDeleting: boolean
}

export function QuestionDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  questionText,
  isDeleting
}: QuestionDeleteDialogProps) {
  const truncatedQuestion = questionText.length > 50 
    ? `${questionText.substring(0, 50)}...` 
    : questionText

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Question</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this question: <span className="font-semibold">&quot;{truncatedQuestion}&quot;</span>? 
            This action cannot be undone and will remove all choices associated with this question.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Question"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
