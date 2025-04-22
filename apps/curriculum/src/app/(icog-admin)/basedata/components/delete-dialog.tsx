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
import Image from "next/image"

// Constants
const DELETE_ICON_PATH = "/dialogdelete.svg";

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading?: boolean
}

export function DeleteDialog({ open, onOpenChange, onConfirm, loading }: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="relative w-full h-10">
          <Image src={DELETE_ICON_PATH} alt="Delete" fill objectFit="contain" />
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Are you sure you want to delete this?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Please click the button below in order to proceed with deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-auto gap-5">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={loading}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 