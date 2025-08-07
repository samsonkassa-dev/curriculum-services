
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SessionForm } from "../../sessions/components/session-form"

interface EditSessionDialogProps {
  trainingId: string
  companyId: string
  sessionId: string | null
  cohortId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditSessionDialog({
  trainingId,
  companyId,
  sessionId,
  cohortId,
  isOpen,
  onClose,
  onSuccess
}: EditSessionDialogProps) {
  const handleSuccess = () => {
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-semibold">Edit Session</DialogTitle>
          </div>
        </DialogHeader>

        {sessionId && isOpen && (
          <SessionForm
            trainingId={trainingId}
            companyId={companyId}
            cohortId={cohortId}
            sessionId={sessionId}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
} 