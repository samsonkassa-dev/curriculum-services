"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEditProfile } from "@/lib/hooks/useEditProfile"
import { useProfilePicture } from "@/lib/hooks/useProfilePicture"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  defaultValues?: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    profilePictureUrl?: string
  }
}

export function EditProfileModal({ isOpen, onClose, defaultValues }: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadProfilePicture, editProfile } = useEditProfile()
  const savedProfilePicture = typeof window !== 'undefined' ? localStorage.getItem('profile_picture_url') : null
  
  // Initialize with saved picture from localStorage, fallback to default
  const [previewUrl, setPreviewUrl] = useState<string | null>(savedProfilePicture || '/camera.svg')
  
  const [firstName, setFirstName] = useState(defaultValues?.firstName || '')
  const [lastName, setLastName] = useState(defaultValues?.lastName || '')
  const [email, setEmail] = useState(defaultValues?.email || '')
  const [phone, setPhone] = useState(defaultValues?.phone?.slice(4) || '') // Remove +251 prefix if exists

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 9) {
      setPhone(value)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Upload image first
      const url = await uploadProfilePicture.mutateAsync(file)
      // Then set the returned URL as preview
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async () => {
    await editProfile.mutateAsync({
      firstName,
      lastName,
      email,
      phoneNumber: null // As requested
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-[800px] max-w-[350px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-6">
          {/* Profile Picture */}

          <hr className="border-[#f2f2f2] border-[1px] -mx-6" />

          <div className="flex justify-center">
            <div className="relative cursor-pointer" onClick={handleImageClick}>
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {previewUrl && previewUrl !== '/camera.svg' ? (
                  <img src={previewUrl} alt="p" className="w-full h-full object-cover" />
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

          <div className="md:px-10 space-y-4">
            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  type="email"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="flex gap-2 w-full">
                  <Input className="w-[100px]" value="+251" disabled />
                  <Input
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="9XXXXXXXX or 7XXXXXXXX"
                    className="flex-1 w-full"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center py-10">
              <Button
                onClick={handleSubmit}
                className="bg-brand text-white px-8"
                disabled={editProfile.isPending || uploadProfilePicture.isPending}
              >
                {editProfile.isPending ? 'Updating...' : 'Edit'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 