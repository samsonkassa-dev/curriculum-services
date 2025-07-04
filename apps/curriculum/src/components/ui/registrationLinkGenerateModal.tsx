"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGenerateRegistrationLink } from "@/lib/hooks/useGenerateRegistrationLink"
import { Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface RegistrationLinkGenerateModalProps {
  isOpen: boolean
  onClose: () => void
  trainingId: string
  trainingTitle: string
}

// Helper function to convert time units to minutes
const convertToMinutes = (value: number, unit: string): number => {
  switch (unit) {
    case 'minutes':
      return value
    case 'hours':
      return value * 60
    case 'days':
      return value * 60 * 24
    case 'weeks':
      return value * 60 * 24 * 7
    default:
      return value
  }
}

// Helper function to get readable time format
const getReadableTimeFormat = (value: number, unit: string): string => {
  if (value === 1) {
    return `1 ${unit.slice(0, -1)}` // Remove 's' for singular
  }
  return `${value} ${unit}`
}

export function RegistrationLinkGenerateModal({ 
  isOpen, 
  onClose, 
  trainingId,
  trainingTitle
}: RegistrationLinkGenerateModalProps) {
  const [timeValue, setTimeValue] = useState<number>(1)
  const [timeUnit, setTimeUnit] = useState<string>("hours")
  const [generatedLink, setGeneratedLink] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const { mutateAsync: generateLink, isPending } = useGenerateRegistrationLink()

  const handleSubmit = async () => {
    try {
      const expiryMinutes = convertToMinutes(timeValue, timeUnit)
      const response = await generateLink({
        trainingId,
        expiryMinutes
      })
      
      // The response structure has id nested inside registrationLink
      const linkId = response.registrationLink.id
      const fullLink = `https://student-registration-blue.vercel.app/register/${linkId}`
      setGeneratedLink(fullLink)
    } catch (error) {
      console.log("Failed to generate registration link:", error)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleOpenLink = () => {
    window.open(generatedLink, '_blank')
  }

  const handleClose = () => {
    setGeneratedLink("")
    setCopied(false)
    setTimeValue(1)
    setTimeUnit("hours")
    onClose()
  }

  const timeUnits = [
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Registration Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Training Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Training:</p>
            <p className="font-medium text-gray-900">{trainingTitle}</p>
          </div>

          {!generatedLink ? (
            <>
              {/* Custom Expiry Time Selection */}
              <div className="space-y-4">
                <Label>Link Expiry Time</Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      value={timeValue}
                      onChange={(e) => setTimeValue(parseInt(e.target.value) || 1)}
                      placeholder="Enter time"
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Select value={timeUnit} onValueChange={setTimeUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Link will expire in {getReadableTimeFormat(timeValue, timeUnit)}
                </p>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isPending || timeValue <= 0}
                  className="bg-brand hover:bg-brand-primary text-white"
                >
                  {isPending ? "Generating..." : "Generate Link"}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Generated Link Display */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Generated Registration Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={generatedLink} 
                      readOnly 
                      className="flex-1 bg-gray-50 cursor-default select-all focus:outline-none focus:ring-0"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleOpenLink}
                      className="shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setGeneratedLink("")
                      setTimeValue(1)
                      setTimeUnit("hours")
                    }}
                    className="bg-brand hover:bg-brand-primary text-white"
                  >
                    Generate Another
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
