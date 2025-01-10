/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { OutlineSidebar } from "@/components/ui/outline-sidebar"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Training {
  id: string
  title: string
  cities: Array<{
    id: string
    name: string
    country: {
      id: string
      name: string
    }
  }>
  duration: number
  durationType: string
  trainingPurposes: Array<{
    id: string
    name: string
  }>
  ageGroups: Array<{
    id: string
    name: string
    range: string
  }>
  targetAudienceGenders: string[]
  economicBackgrounds: Array<{
    id: string
    name: string
  }>
  academicQualifications: Array<{
    id: string
    name: string
  }>
}

interface OverviewEditProps {
  training: Training
  onSave: (data: any) => void
  onCancel: () => void
}

export function OverviewEdit({ training, onSave, onCancel }: OverviewEditProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeSection, setActiveSection] = useState("Title")
  
  // State for form values
  const [title, setTitle] = useState(training.title || "")
  const [location, setLocation] = useState(training.cities[0]?.name || "")
  const [duration, setDuration] = useState(training.duration?.toString() || "")
  const [durationType, setDurationType] = useState(training.durationType?.toLowerCase() || "")
  const [targetAudience, setTargetAudience] = useState(() => {
    const audiences = [
      ...training.ageGroups.map(ag => `Age Group: ${ag.name} (${ag.range})`),
      ...training.targetAudienceGenders.map(g => `Gender: ${g.toLowerCase()}`),
      ...training.economicBackgrounds.map(eb => `Economic Background: ${eb.name}`),
      ...training.academicQualifications.map(aq => `Academic Qualification: ${aq.name}`)
    ]
    return audiences.join('\n')
  })
  const [purpose, setPurpose] = useState(training.trainingPurposes[0]?.name || "")

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const outlineItems = [
    { label: "Title", isCompleted: !!title.trim() },
    { label: "Location", isCompleted: !!location.trim() },
    { label: "Duration", isCompleted: !!duration && !!durationType },
    { label: "Target Audience", isCompleted: !!targetAudience.trim() },
    { label: "Purpose of the training", isCompleted: !!purpose.trim() },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "Title":
        return (
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Title"
            className="max-w-md"
          />
        )
      case "Location":
        return (
          <Input 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter Location"
            className="max-w-md"
          />
        )
      case "Duration":
        return (
          <div className="flex gap-4 max-w-md">
            <Input 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter Duration"
              type="number"
              className="w-32"
            />
            <Select
              value={durationType}
              onValueChange={setDurationType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Duration Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      case "Target Audience":
        return (
          <Textarea
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Enter Target Audience"
            className="min-h-[200px]"
          />
        )
      case "Purpose of the training":
        return (
          <Textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Enter Purpose"
            className="min-h-[200px]"
          />
        )
      default:
        return null
    }
  }

  const handleSave = () => {
    onSave({
      title,
      location,
      duration: Number(duration),
      durationType: durationType.toUpperCase(),
      targetAudience,
      purpose
    })
  }

  const renderMobileHeader = () => {
    if (!isMobile) return null
    
    if (showSidebar) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-white z-[51] flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">Overview Outline</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSidebar(false)}
            className="hover:bg-transparent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost"
          className="text-brand flex items-center gap-2 hover:bg-transparent hover:text-brand p-0"
          onClick={() => setShowSidebar(true)}
        >
          <Menu className="h-5 w-5" />
          <span>Overview Outline</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      "px-[7%] py-10",
      isMobile ? "block" : "flex gap-8"
    )}>
      {renderMobileHeader()}
      
      {(!isMobile || showSidebar) && (
        <div className={cn(
          "bg-white",
          isMobile ? "fixed inset-0 z-50 pt-16 px-4 pb-4" : "w-[300px]"
        )}>
          <OutlineSidebar 
            title="Overview Outline"
            items={outlineItems}
            activeItem={activeSection}
            onItemClick={(section) => {
              setActiveSection(section)
              if (isMobile) setShowSidebar(false)
            }}
          />
        </div>
      )}

      <EditFormContainer
        title={`${activeSection} (Edit)`}
        description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
      >
        <div className="space-y-6">
          {renderContent()}

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-brand text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </EditFormContainer>
    </div>
  )
} 