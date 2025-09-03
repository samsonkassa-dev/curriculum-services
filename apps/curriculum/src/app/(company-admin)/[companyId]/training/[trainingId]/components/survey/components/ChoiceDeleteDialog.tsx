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
  choiceOrder: string
  isDeleting: boolean
}

export function ChoiceDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  choiceText,
  choiceOrder,
  isDeleting
}: ChoiceDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Choice</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove choice <span className="font-semibold">{choiceOrder}</span>: &quot;{choiceText || 'Empty choice'}&quot;? 
            This action cannot be undone and may affect survey responses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                <span>Removing...</span>
              </div>
            ) : (
              "Remove Choice"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 
