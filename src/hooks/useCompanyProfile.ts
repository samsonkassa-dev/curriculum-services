import { CompanyProfileFormData } from "@/types/company"
import { useState } from "react"

export const useCompanyProfile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitCompanyProfile = async (data: CompanyProfileFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/company-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit company profile')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { submitCompanyProfile, isLoading, error }
} 