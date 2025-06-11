"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PencilIcon, Trash2, CalendarIcon, ClipboardList } from "lucide-react"
import { Survey } from "@/lib/hooks/useSessionAssesment"

interface SurveyCardProps {
  survey: Survey
  onDelete: () => void
  onView: () => void
  onEdit: () => void
}

export function SurveyCard({
  survey,
  onDelete,
  onView,
  onEdit
}: SurveyCardProps) {
  return (
    <Card className="bg-white border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2">{survey.name}</h3>
          <p className="text-gray-500 text-sm mb-4">{survey.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {survey.sessionName && (
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span>Session: {survey.sessionName}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-gray-400" />
              <span>Survey ID: {survey.id.substring(0, 8)}...</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onView}
            className="h-8"
          >
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
} 