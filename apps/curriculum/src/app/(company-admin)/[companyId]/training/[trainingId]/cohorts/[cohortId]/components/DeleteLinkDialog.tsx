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

interface DeleteLinkDialogProps {
  isOpen: boolean
  traineeName?: string
  isDeleting?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteLinkDialog({ isOpen, traineeName, isDeleting, onCancel, onConfirm }: DeleteLinkDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(o)=> !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="">Delete Survey Link</AlertDialogTitle>
          <AlertDialogDescription className="text-black">
            Are you sure you want to delete the survey link for <strong>{traineeName}</strong>? This will invalidate their current link.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Link"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


