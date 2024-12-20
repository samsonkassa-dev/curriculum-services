import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { Button } from "./button"
import { Textarea } from "./textarea"
import { Loader2 } from "lucide-react"

interface RejectionDialogProps {
  onReject: (reason: string) => void
  isRejecting: boolean
}

export function RejectionDialog({ onReject, isRejecting }: RejectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    onReject(reason)
    setOpen(false)
    setReason("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
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
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!reason.trim() || isRejecting}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Feedback'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 