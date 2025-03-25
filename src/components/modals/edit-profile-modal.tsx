"use client"

import { useState, useRef, useEffect } from "react"
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
import { Shield, User } from "lucide-react"
import Image from "next/image"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'profile' | 'security'
  isFirstTimeLogin?: boolean
}

// Define form schema with Zod
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional(), // Email is read-only
  phoneNumber: z
    .string()
    .regex(/^[79]\d{8}$/, "Phone number must start with 7 or 9 and be 9 digits")
    .optional()
    .nullable(),
})

// Type inference from schema
type ProfileFormValues = z.infer<typeof profileSchema>

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

export function EditProfileModal({ 
  isOpen, 
  onClose, 
  initialTab = 'profile',
  isFirstTimeLogin = false 
}: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { profile, uploadProfilePicture, editProfile, changePassword } = useProfile()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>(initialTab)
  const [showPasswordForm, setShowPasswordForm] = useState(isFirstTimeLogin)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)

  // Profile form with default values from profile data
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profile.data ? {
      firstName: profile.data.firstName,
      lastName: profile.data.lastName,
      email: profile.data.email,
      phoneNumber: profile.data.phoneNumber?.slice(4) || '',
    } : undefined,
  })

  // Reset form when profile data changes
  useEffect(() => {
    if (profile.data) {
      resetProfile({
        firstName: profile.data.firstName,
        lastName: profile.data.lastName,
        email: profile.data.email,
        phoneNumber: profile.data.phoneNumber?.slice(4) || '',
      })
    }
  }, [profile.data, resetProfile])

  // Password form
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 9) {
      profileRegister('phoneNumber').onChange({ target: { value } })
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadProfilePicture.mutateAsync(file)
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/camera.svg'
  }

  const onProfileSubmit = async (data: ProfileFormValues) => {
    await editProfile.mutateAsync({
      ...data,
      email: data.email || '',
      phoneNumber: data.phoneNumber ? `+251${data.phoneNumber}` : null,
    })
    onClose()
  }

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

  const handleClose = () => {
 
      onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] p-0">
        {!isFirstTimeLogin && profile.isLoading ? (
          <div className="flex items-center justify-center p-8">
            <DialogTitle className="sr-only">Loading Profile</DialogTitle>
            Loading...
          </div>
        ) : !isFirstTimeLogin && profile.error ? (
          <div className="flex items-center justify-center p-8 text-red-500">
            <DialogTitle className="sr-only">Profile Error</DialogTitle>
            Failed to load profile
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-semibold">Account</DialogTitle>
            </DialogHeader>

            <hr className="border-[#f2f2f2]" />

            {/* {isFirstTimeLogin && (
              <div className="bg-blue-50 p-4 text-sm text-blue-700">
                Please change your password before continuing
              </div>
            )} */}

            <div className="flex flex-col sm:flex-row min-h-[480px] ">
              {/* Sidebar Navigatio*/}
              <div className="sm:w-[200px] w-full border-r border-[#f2f2f2] -mt-4 py-5">
                <div className="space-y-4 w-[70%] mx-auto md:w-full">
                  <div
                    className={`flex items-center gap-2 px-6 py-1 cursor-pointer rounded-lg mx-2 text-md font-normal ${
                      activeTab === "profile" ? "bg-[#e7f2ff] text-brand" : ""
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User size={20} />
                    <span>Profile</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-6 py-1 cursor-pointer rounded-lg mx-2 text-md font-normal ${
                      activeTab === "security" ? "bg-[#e7f2ff] text-brand" : ""
                    }`}
                    onClick={() => setActiveTab("security")}
                  >
                    <Shield size={20} />
                    <span>Security</span>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex-1 px-6 space-y-6">
                  {/* Profile Picture */}
                  <div className="flex justify-center mt-6">
                    <div
                      className="relative cursor-pointer"
                      onClick={handleImageClick}
                    >
                      <div className="w-20 h-20 rounded-full bg-[#e4e4e4] flex items-center justify-center overflow-hidden">
                        {profile.data?.profilePictureUrl ? (
                          <img
                            src={profile.data.profilePictureUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/camera.svg'
                            }}
                          />
                        ) : (
                          <img src="/camera.svg" alt="Upload" className="w-8 h-8" />
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        aria-label="Upload profile picture"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">First Name</label>
                        <Input
                          {...profileRegister('firstName')}
                          placeholder="Enter first name"
                          className="w-full"
                        />
                        {profileErrors.firstName && (
                          <p className="text-red-500 text-sm">{profileErrors.firstName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          {...profileRegister('lastName')}
                          placeholder="Enter last name"
                          className="w-full"
                        />
                        {profileErrors.lastName && (
                          <p className="text-red-500 text-sm">{profileErrors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          {...profileRegister('email')}
                          placeholder="Enter email address"
                          type="email"
                          className="w-full"
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <div className="flex gap-2 w-full">
                          <Input className="w-[100px]" value="+251" disabled />
                          <Input
                            {...profileRegister('phoneNumber')}
                            placeholder="9XXXXXXXX or 7XXXXXXXX"
                            className="flex-1"
                          />
                        </div>
                        {profileErrors.phoneNumber && (
                          <p className="text-red-500 text-sm">{profileErrors.phoneNumber.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center py-10">
                      <Button
                        type="submit"
                        className="bg-brand hover:bg-blue-700 text-white px-8"
                        disabled={!isProfileDirty || editProfile.isPending}
                      >
                        {editProfile.isPending ? "Updating..." : "Edit"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === "security" && !showPasswordForm && (
                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex-1">
                    <div className="space-y-3">
                      <h2 className="text-xl font-semibold">Password</h2>
                      <p className="text-gray-500 text-sm">
                        Ensure your account&apos;s security by regularly updating
                        your password. Use the form below to create a strong and
                        unique password.
                      </p>
                      <Button
                        onClick={() => setShowPasswordForm(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && showPasswordForm && (
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 p-6">
                  {!isFirstTimeLogin && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Current Password
                      </label>
                      <div className="relative w-full">
                        <Input
                          type={showOldPassword ? "text" : "password"}
                          {...passwordRegister('oldPassword')}
                          placeholder="Enter current password"
                          className="w-full pr-10 text-sm"
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
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      New Password
                    </label>
                    <div className="relative w-full">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        {...passwordRegister('newPassword')}
                        placeholder="Enter new password"
                        className="w-full pr-10 text-sm"
                      />
                      <button
                        title="Toggle password visibility"
                        type="button"
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <div className="relative w-full">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...passwordRegister('confirmPassword')}
                        placeholder="Confirm new password"
                        className="w-full pr-10 text-sm"
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

                  <div className="py-10 flex justify-start">
                    <Button
                      type="submit"
                      className="bg-brand  hover:bg-blue-700 text-white"
                    >
                      Change Password
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 