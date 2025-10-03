"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown } from "lucide-react"

interface AssessmentSurveyToolsProps {
  // Survey props
  showSurveyTools: boolean
  setShowSurveyTools: (show: boolean) => void
  surveys: Array<{ id: string; name: string }>
  selectedSurveyId: string
  setSelectedSurveyId: (id: string) => void
  
  // Assessment props
  showAssessmentTools: boolean
  setShowAssessmentTools: (show: boolean) => void
  assessments: Array<{ id: string; name: string }>
  selectedAssessmentId: string
  setSelectedAssessmentId: (id: string) => void
}

export function AssessmentSurveyTools({
  showSurveyTools,
  setShowSurveyTools,
  surveys,
  selectedSurveyId,
  setSelectedSurveyId,
  showAssessmentTools,
  setShowAssessmentTools,
  assessments,
  selectedAssessmentId,
  setSelectedAssessmentId,
}: AssessmentSurveyToolsProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Toggle Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            setShowSurveyTools(!showSurveyTools)
            // Close assessment tools when opening survey tools
            if (!showSurveyTools) {
              setShowAssessmentTools(false)
            }
          }}
          title="Show survey completion status"
        >
          <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showSurveyTools ? "rotate-180" : "rotate-0"}`} />
          <span className="hidden sm:inline">Survey Status</span>
          <span className="sm:hidden">Survey</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            setShowAssessmentTools(!showAssessmentTools)
            // Close survey tools when opening assessment tools
            if (!showAssessmentTools) {
              setShowSurveyTools(false)
            }
          }}
          title="Show assessment scores"
        >
          <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showAssessmentTools ? "rotate-180" : "rotate-0"}`} />
          <span className="hidden sm:inline">Assessment Scores</span>
          <span className="sm:hidden">Assessment</span>
        </Button>
      </div>

      {/* Survey Tools Panel */}
      {showSurveyTools && (
        <div className="rounded-md border border-gray-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
              <SelectTrigger className="w-[300px] h-10">
                <SelectValue placeholder="Select survey to view completion status" />
              </SelectTrigger>
              <SelectContent>
                {surveys.length === 0 ? (
                  <SelectItem value="none" disabled>No surveys available</SelectItem>
                ) : (
                  surveys.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              Shows which students have completed the selected survey
            </span>
          </div>
        </div>
      )}

      {/* Assessment Tools Panel */}
      {showAssessmentTools && (
        <div className="rounded-md border border-gray-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
              <SelectTrigger className="w-[300px] h-10">
                <SelectValue placeholder="Select assessment to view scores" />
              </SelectTrigger>
              <SelectContent>
                {assessments.length === 0 ? (
                  <SelectItem value="none" disabled>No assessments available</SelectItem>
                ) : (
                  assessments.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              Shows post-assessment scores for students who completed the assessment
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

