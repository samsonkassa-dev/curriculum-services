"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Content } from "@/lib/hooks/useContent"
import { RejectionDialog } from "@/components/ui/rejection-dialog"
import { useAcceptContent, useRejectContent } from "@/lib/hooks/useContent"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface ContentApprovalModalProps {
  content: Content
  isOpen: boolean
  onClose: () => void
}

export function ContentApprovalModal({ content, isOpen, onClose }: ContentApprovalModalProps) {
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const { mutateAsync: acceptContent, isPending: isAccepting } = useAcceptContent()
  const { mutateAsync: rejectContent, isPending: isRejecting } = useRejectContent()
  const [reason, setReason] = useState("")

  const handleAccept = async () => {
    await acceptContent(content.id)
    onClose()
  }

  const handleReject = async (reason: string) => {
    await rejectContent({ contentId: content.id, reason })
    setShowRejectionDialog(false)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen && !showRejectionDialog} onOpenChange={onClose}>
        <DialogContent className="p-0">
          <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
            <DialogTitle>{content.name}</DialogTitle>
          </DialogHeader>

          <div className="p-4">
            <div className="flex justify-end gap-3 mb-6">
              <Button
                variant="outline"
                className="bg-[#fce7e1] text-[#FE2929] border-[#FE2929] px-6"
                onClick={() => setShowRejectionDialog(true)}
              >
                Reject
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isAccepting}
                className="bg-[#E7FCE8] hover:bg-[#d5ebd6] text-[#1F9254] border-0 px-6"
              >
                Accept
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-8 px-8 pb-28">
              <div>
                <h3 className="font-medium mb-4">Links</h3>
                <div className="space-y-2">
                  {content.link ? (
                    <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 block">
                      {content.link}
                    </a>
                  ) : (
                    <p className="text-gray-500">No link provided</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Reference</h3>
                <div className="space-y-2">
                  {content.referenceLink ? (
                    <a href={content.referenceLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 block">
                      {content.referenceLink}
                    </a>
                  ) : (
                    <p className="text-gray-500">No reference provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Give a detailed reason why you rejected the content?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleReject(reason)}
                disabled={!reason.trim() || isRejecting}
                className="text-white"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Feedback"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 