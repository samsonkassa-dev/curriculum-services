"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProfile } from "@/lib/hooks/useProfile"
import Image from "next/image"

interface FirstTimePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export function FirstTimePasswordModal({ 
  isOpen, 
  onClose,
}: FirstTimePasswordModalProps) {
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { changePassword } = useProfile()

  // Password form
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await changePassword.mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      
      onClose();
      resetPassword();
    } catch (error: unknown) {
      // Error handling is done in the mutation
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] p-8 bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 mt-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showOldPassword ? "text" : "password"}
                {...passwordRegister('oldPassword')}
                placeholder="Enter current password"
                className="w-full pr-10 text-sm py-6"
              />
              <button
                type="button"
                title="Toggle password visibility"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Image 
                  src="/solar_eye-broken.svg" 
                  alt="Toggle password visibility"
                  width={20}
                  height={20}
                  className={showOldPassword ? "opacity-70" : "opacity-40"}
                />
              </button>
            </div>
            {passwordErrors.oldPassword && (
              <p className="text-red-500 text-sm">{passwordErrors.oldPassword.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                {...passwordRegister('newPassword')}
                placeholder="Enter new password"
                className="w-full pr-10 text-sm py-6"
              />
              <button
                type="button"
                title="Toggle password visibility"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Image 
                  src="/solar_eye-broken.svg" 
                  alt="Toggle password visibility"
                  width={20}
                  height={20}
                  className={showNewPassword ? "opacity-70" : "opacity-40"}
                />
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...passwordRegister('confirmPassword')}
                placeholder="Confirm new password"
                className="w-full pr-10 text-sm py-6"
              />
              <button
                type="button"
                title="Toggle password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Image 
                  src="/solar_eye-broken.svg" 
                  alt="Toggle password visibility"
                  width={20}
                  height={20}
                  className={showConfirmPassword ? "opacity-70" : "opacity-40"}
                />
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              className="bg-brand hover:bg-blue-700 text-white px-8 py-6 text-sm font-medium"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 