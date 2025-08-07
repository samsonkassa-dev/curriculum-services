"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SurveyType } from "@/lib/hooks/useSurvey"

interface SurveySettingsProps {
  surveyName: string
  setSurveyName: (name: string) => void
  surveyType: SurveyType
  setSurveyType: (type: SurveyType) => void
  surveyDescription: string
  setSurveyDescription: (description: string) => void
  isEditMode: boolean
}

export function SurveySettings({
  surveyName,
  setSurveyName,
  surveyType,
  setSurveyType,
  surveyDescription,
  setSurveyDescription,
  isEditMode
}: SurveySettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="surveyName" className="text-sm font-medium">
          Survey Name {isEditMode && '(Read-only)'}
        </Label>
        <Input
          id="surveyName"
          value={surveyName}
          onChange={(e) => setSurveyName(e.target.value)}
          placeholder="Enter survey name"
          className={`mt-2 ${isEditMode ? 'cursor-not-allowed opacity-60 bg-gray-50' : ''}`}
          readOnly={isEditMode}
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium">
          Survey Type {isEditMode && '(Read-only)'}
        </Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {(['BASELINE', 'ENDLINE', 'OTHER'] as SurveyType[]).map((type) => (
            <Button
              key={type}
              variant={surveyType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSurveyType(type)}
              disabled={isEditMode}
              className={`h-auto p-3 font-semibold transition-all duration-200 ${
                isEditMode
                  ? 'cursor-not-allowed opacity-60 bg-gray-50'
                  : surveyType === type 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                    : "border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <Label htmlFor="surveyDescription" className="text-sm font-medium">
          Description {isEditMode && '(Read-only)'}
        </Label>
        <Textarea
          id="surveyDescription"
          value={surveyDescription}
          onChange={(e) => setSurveyDescription(e.target.value)}
          placeholder="Enter survey description"
          className={`mt-2 ${isEditMode ? 'cursor-not-allowed opacity-60 bg-gray-50' : ''}`}
          readOnly={isEditMode}
          rows={4}
        />
      </div>
    </div>
  )
}
