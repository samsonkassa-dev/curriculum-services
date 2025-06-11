"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PencilIcon, Plus } from "lucide-react"
import { SurveyQuestionManager } from "./SurveyQuestionManager"
import { SurveyDetail } from "@/lib/hooks/useSessionAssesment"

interface ViewSurveyDetailsProps {
  surveyDetail: SurveyDetail
  onBackToList: () => void
  onEditSurvey: (surveyId: string) => void
  onAddQuestion: (surveyId: string) => void
  onRefreshDetails: () => void
}

export function ViewSurveyDetails({
  surveyDetail,
  onBackToList,
  onEditSurvey,
  onAddQuestion,
  onRefreshDetails
}: ViewSurveyDetailsProps) {
  return (
    <div className="px-[7%] py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">View Survey</h2>
          <p className="text-gray-600 mt-1">
            {surveyDetail?.name || "Loading..."}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => onEditSurvey(surveyDetail.id)}
            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Survey Details
          </Button>
          <Button
            variant="outline"
            onClick={onBackToList}
          >
            Back to Survey List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Survey Details */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Survey Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Survey Name</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                {surveyDetail?.name || "Loading..."}
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[60px]">
                {surveyDetail?.description || "Loading..."}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Survey Questions */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold">Survey Questions</h3>
              <p className="text-gray-600 text-sm mt-1">
                Questions in this survey that will be presented to trainees
              </p>
            </div>
            
            <Button
              onClick={() => onAddQuestion(surveyDetail.id)}
              className="flex items-center gap-1 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>
          
          {surveyDetail?.surveyEntries ? (
            <SurveyQuestionManager
              surveyEntries={surveyDetail.surveyEntries}
              surveyId={surveyDetail.id}
              onRefresh={onRefreshDetails}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Loading survey questions...</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
} 