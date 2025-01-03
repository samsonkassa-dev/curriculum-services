"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy } from "lucide-react"

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string) => void
  inviteLink?: string
  isLoading?: boolean
}

export function InviteModal({ isOpen, onClose, onInvite, inviteLink, isLoading }: InviteModalProps) {
  const [email, setEmail] = useState("");

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Curriculum Admin</DialogTitle>
        </DialogHeader>
        <hr className="my-1 -mx-6" />
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="flex w-full gap-2">
              <div className="w-[80%]">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter email address of user"
                  type="email"
                  className="w-full"
                />
              </div>
              <div className="flex justify-center items-center">
                <Button
                  onClick={() => onInvite(email)}
                  className="bg-brand text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Invite"}
                </Button>
              </div>
            </div>
          </div>

          <hr className="-mx-6" />

          <div className="space-y-2">
            <label className="text-sm font-medium">Copy link</label>
            <div className="flex w-full gap-2">
              <div className="w-[80%]">
                <Input value={inviteLink} readOnly className="w-full" />
              </div>
              <div className="flex justify-center items-center">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 