"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/Input"
import Image from "next/image"
import { useChangePassword } from "../../hooks/useChangePassword"

interface FirstTimePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export function FirstTimePasswordModal({ 
  isOpen, 
  onClose,
}: FirstTimePasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { changePassword, isLoading } = useChangePassword()

  // Password form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormValues) => {
    const result = await changePassword({ 
      oldPassword: data.oldPassword,
      password: data.password 
    })
    
    if (result.success) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] p-8 bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Change Your Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <div className="space-y-3">
            <label className="text-sm font-medium">
              Old Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register('oldPassword')}
                placeholder="Enter old password"
                className="w-full pr-10 text-sm py-6"
              />
              <button
                type="button"
                title="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Image 
                  src="/solar_eye-broken.svg" 
                  alt="Toggle password visibility"
                  width={20}
                  height={20}
                  className={showPassword ? "opacity-70" : "opacity-40"}
                />
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register('password')}
                placeholder="Enter new password"
                className="w-full pr-10 text-sm py-6"
              />
              <button
                type="button"
                title="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Image 
                  src="/solar_eye-broken.svg" 
                  alt="Toggle password visibility"
                  width={20}
                  height={20}
                  className={showPassword ? "opacity-70" : "opacity-40"}
                />
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...register('confirmPassword')}
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
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-brand hover:bg-blue-700 text-white px-6 py-3 text-sm font-medium rounded"
              disabled={isLoading}
            >
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 