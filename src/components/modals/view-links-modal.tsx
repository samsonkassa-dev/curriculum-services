"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Content, useDeleteContentLink, useEditContentLink } from "@/lib/hooks/useContent"
import { ContentModal } from "./content-modal"
import { DeleteLinkModal } from "./delete-link-modal"
import { X } from "lucide-react"

interface ViewLinksModalProps {
  content: Content
  isOpen: boolean
  onClose: () => void
  showActions?: boolean
}

export function ViewLinksModal({ 
  content, 
  isOpen, 
  onClose,
  showActions = true 
}: ViewLinksModalProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { mutate: editLink, isPending: isEditing } = useEditContentLink()
  const { mutate: deleteLink, isPending: isDeleting } = useDeleteContentLink()

  const handleEdit = (data: { link: string; referenceLink: string }) => {
    editLink({ 
      contentId: content.id, 
      ...data 
    })
    setShowEditModal(false)
  }

  const handleDelete = () => {
    deleteLink(content.id)
    setShowDeleteModal(false)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl max-w-[330px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {content.name}
            </DialogTitle>
          </DialogHeader>
          <hr className="border-[#f2f2f2] border-[1px] -mx-6" />
          <div className="mt-4 rounded-lg border border-gray-100 overflow-hidden mx-5">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Links</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Reference</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="py-3 px-4 text-sm">Name</td>
                  <td className="py-3 px-4 text-sm">
                    {content.link && (
                      <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        {content.link}
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {content.referenceLink && (
                      <a href={content.referenceLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        {content.referenceLink}
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {showActions && (
                      <div className="flex gap-4 justify-end">
                        <button 
                          className="text-blue-500"
                          onClick={() => setShowEditModal(true)}
                        >
                          <img src="/edit.svg" alt="Edit" className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-red-500"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          <img src="/delete.svg" alt="Delete" className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <ContentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEdit}
        defaultValues={{
          link: content.link || '',
          referenceLink: content.referenceLink || ''
        }}
        mode="edit"
      />

      <DeleteLinkModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  )
} 