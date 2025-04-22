"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Content } from "@/lib/hooks/useContent"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ContentModal } from "@/components/modals/content-modal"
import { useAddContentLink } from "@/lib/hooks/useContent"
import { Button } from "@/components/ui/button"
import { ViewLinksModal } from "@/components/modals/view-links-modal"
import { ContentApprovalModal } from "./content-approval-modal"
import { useUserRole } from "@/lib/hooks/useUserRole"

function ContentLinkCell({ content }: { content: Content }) {
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const { mutate: addLink, isPending } = useAddContentLink()
  
  const { isContentDeveloper, isIcogAdmin } = useUserRole()
  const canOnlyView = isContentDeveloper || isIcogAdmin

  const handleAddLink = (data: { link: string; referenceLink: string }) => {
    addLink({ contentId: content.id, ...data })
    setShowLinkModal(false)
  }

  if (content.link) {
    return (
      <>
        <Button
          variant="ghost" 
          className="flex items-center gap-2 text-blue-500 p-0 hover:text-brand hover:bg-transparent"
          onClick={() => canOnlyView ? setShowViewModal(true) : setShowApprovalModal(true)}
        >
          {/* <img src="/modulePlus.svg" alt="View" className="w-4 h-4" /> */}

          <span>View Link</span>
        </Button>

        {canOnlyView ? (
          <ViewLinksModal
            content={content}
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            showActions={isContentDeveloper}
          />
        ) : (
          <ContentApprovalModal
            content={content}
            isOpen={showApprovalModal}
            onClose={() => setShowApprovalModal(false)}
          />
        )}
      </>
    )
  }

  if (isContentDeveloper) {
    return (
      <>
        <Button 
          variant="ghost"
          className="flex items-center gap-2 text-blue-500 p-0 hover:text-brand hover:bg-transparent"
          onClick={() => setShowLinkModal(true)}
          disabled={isPending}
        >
          <img src="/modulePlus.svg" alt="Add" className="w-4 h-4" />
          <span>Add Link</span>
        </Button>

        <ContentModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          onSave={handleAddLink}
        />
      </>
    )
  }

  return <span className="text-gray-500">Awaiting Link</span>
}

export const columns: ColumnDef<Content>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({row}) =>{
      const name = row.original
      return name.name || "Name not given"
    }
  },
  {
    accessorKey: "contentFor",
    header: "Content For",
    cell: ({ row }) => {
      const content = row.original
      return content.lessonName || content.sectionName || content.moduleName
    }
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "contentDeveloper",
    header: "Assigned To",
    cell: ({ row }) => row.original.contentDeveloper.email
  },
  {
    accessorKey: "contentFileType",
    header: "File Type",
  },
  {
    accessorKey: "link",
    header: "Content Link",
    cell: ({ row }) => <ContentLinkCell content={row.original} />
  },
  {
    accessorKey: "contentStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.contentStatus
      
      return (
        <Badge 
          variant={
            status === 'PENDING' ? 'pending' :
            status === 'ACCEPTED' ? 'approved' :
            'rejected'
          }
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
      )
    }
  },
] 