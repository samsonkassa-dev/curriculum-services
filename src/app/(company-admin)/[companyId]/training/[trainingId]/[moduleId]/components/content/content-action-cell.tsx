/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Content } from "@/lib/hooks/useContent"
import { ContentApprovalModal } from "./content-approval-modal"

export function ContentActionCell({ row }: { row: any }) {
  const content = row.original as Content
  const [showApprovalModal, setShowApprovalModal] = useState(false)

  const handleDelete = async () => {
    console.log('Delete content:', content.id)
  }

  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 text-blue-500"
          onClick={() => setShowApprovalModal(true)}
        >
          <span className="sr-only">Edit</span>
          <img src="/edit.svg" alt="Edit" className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 text-red-500"
          onClick={handleDelete}
        >
          <span className="sr-only">Delete</span>
          <img src="/delete.svg" alt="Delete" className="w-5 h-5" />
        </Button>
      </div>

      <ContentApprovalModal
        content={content}
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
      />
    </>
  )
} 