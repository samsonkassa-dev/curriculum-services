"use client"

import { Assessment } from "../cat"
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

interface DeleteCatDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  assessment: Assessment | null
  onConfirmDelete: () => Promise<void>
  isDeleting: boolean
}

export function DeleteCatDialog({
  isOpen,
  onOpenChange,
  assessment,
  onConfirmDelete,
  isDeleting
}: DeleteCatDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{assessment?.name}&rdquo;? This action cannot be undone.
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
  );
} 