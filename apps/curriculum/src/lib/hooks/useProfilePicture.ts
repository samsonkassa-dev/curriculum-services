"use client"

import { useState, useEffect } from 'react'
import { getProfilePicture, PROFILE_PICTURE_KEY } from '@/lib/utils/profile'

export function useProfilePicture() {
  const [profilePicture, setProfilePicture] = useState<string>('/profile.svg')

  useEffect(() => {
    // Initial value
    const savedUrl = getProfilePicture()
    if (savedUrl) setProfilePicture(savedUrl)

    // Listen for changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PROFILE_PICTURE_KEY) {
        setProfilePicture(e.newValue || '/profile.svg')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return profilePicture
} 