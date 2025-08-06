"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SurveyType } from "@/lib/hooks/useSurvey"
import { toast } from "sonner"

interface EditSurveyFormProps {
  surveyId: string
  initialName: string
  initialType: SurveyType
  initialDescription: string
  onCancel: () => void
  onSubmit: (data: { surveyId: string; data: { name: string; type: SurveyType; description: string } }) => void
  isSubmitting: boolean
}

export function EditSurveyForm({
  surveyId,
  initialName,
  initialType,
  initialDescription,
  onCancel,
  onSubmit,
  isSubmitting
}: EditSurveyFormProps) {
  const [surveyName, setSurveyName] = useState(initialName)
  const [surveyType, setSurveyType] = useState<SurveyType>(initialType)
  const [surveyDescription, setSurveyDescription] = useState(initialDescription)

  const validateSurveyDetails = () => {
    if (!surveyName.trim()) {
      toast.error("Please enter a survey name")
      return false
    }
    if (!surveyDescription.trim()) {
      toast.error("Please enter a survey description")
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (!validateSurveyDetails()) {
      return
    }

    onSubmit({
      surveyId,
      data: {
        name: surveyName,
        type: surveyType,
        description: surveyDescription
      }
    })
  }

  return (
    <div className="px-[7%] py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Edit Survey Details</h2>
          <p className="text-gray-600 mt-1">
            Update the name and description of your survey
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>

      <div>
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Survey Details</h3>
            <p className="text-sm text-gray-500 mt-1">
              Make changes to the survey information below
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="surveyName">Survey Name</Label>
              <Input
                id="surveyName"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                placeholder="Enter survey name"
                className="w-full mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="surveyType">Survey Type</Label>
              <div className="grid grid-cols-3 gap-3 mt-1">
                {(['BASELINE', 'ENDLINE', 'OTHER'] as SurveyType[]).map((type) => (
                  <Button
                    key={type}
                    variant={surveyType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSurveyType(type)}
                    className={`h-auto p-3 font-semibold transition-all duration-200 ${
                      surveyType === type 
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                        : "border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    type="button"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="surveyDescription">Description</Label>
              <Textarea
                id="surveyDescription"
                value={surveyDescription}
                onChange={(e) => setSurveyDescription(e.target.value)}
                placeholder="Enter survey description"
                className="w-full mt-1"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Details"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-sm text-gray-500">
          <p>To edit questions or add new ones, please return to the survey view.</p>
        </div>
      </div>
    </div>
  )
} 