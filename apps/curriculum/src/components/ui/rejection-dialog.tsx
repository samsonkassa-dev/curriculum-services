import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { Button } from "./button"
import { Textarea } from "./textarea"
import { Loader2 } from "lucide-react"

interface RejectionDialogProps {
  onReject: (reason: string) => void
  isRejecting: boolean
  onOpenChange?: () => void
}

export function RejectionDialog({ onReject, isRejecting, onOpenChange }: RejectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    onReject(reason)
    setOpen(false)
    setReason("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && onOpenChange) {
      onOpenChange()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#fce7e1] text-[#FE2929] border-[#FE2929] px-6"
        >
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Give a detailed reason why you rejected the User?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
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
  );
} 