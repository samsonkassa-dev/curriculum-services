"use client"

import { Student } from "@/lib/hooks/useStudents"
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

interface DeleteStudentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
  onConfirmDelete: () => Promise<void>
  isDeleting: boolean
  title?: string
  description?: string
}

export function DeleteStudentDialog({
  isOpen,
  onOpenChange,
  student,
  onConfirmDelete,
  isDeleting,
  title,
  description
}: DeleteStudentDialogProps) {
  const dialogTitle = title || "Delete Student"
  const dialogDescription = description || 
    `Are you sure you want to delete ${student?.firstName} ${student?.lastName}? This action cannot be undone.`

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {dialogDescription}
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