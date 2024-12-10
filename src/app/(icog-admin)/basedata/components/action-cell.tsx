/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "./delete-dialog"
import { AddDataDialog } from "../add-data-dialog"
import { BaseData } from "../columns"
import { useBaseData } from "@/lib/hooks/use-base-data"
import { BaseDataType } from "@/types/base-data"

export function ActionCell({ row, activeTab }: { row: any; activeTab: string }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const item = row.original as BaseData
  const { update, remove, isUpdateLoading, isDeleteLoading } = useBaseData(activeTab as BaseDataType)

  const handleUpdate = async (data: { name: string; description: string }) => {
    await update({ id: item.id, data });
    setShowEditDialog(false);
  }

  const handleDelete = async () => {
    await remove(item.id);
    setShowDeleteDialog(false);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
          onClick={() => setShowEditDialog(true)}
        >
          <span className="sr-only">Edit</span>
          <img src="/edit.svg" alt="Edit" className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 text-red-500"
          onClick={() => setShowDeleteDialog(true)}
        >
          <span className="sr-only">Delete</span>
          <img src="/delete.svg" alt="Delete" className="h-6 w-6" />
        </Button>
      </div>

      <DeleteDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        loading={isDeleteLoading}
      />

      <AddDataDialog 
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        initialData={item}
        onUpdateData={handleUpdate}
        isLoading={isUpdateLoading}
      />
    </>
  )
} 