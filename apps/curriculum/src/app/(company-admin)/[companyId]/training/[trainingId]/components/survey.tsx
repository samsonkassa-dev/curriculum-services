"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loading } from "@/components/ui/loading"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  useCreateSurvey, 
  useSurveys,
  useSurveyDetail,
  useUpdateSurvey,
  useDeleteSurvey,
  useAddQuestionToSurvey,
  SurveyQuestion
} from "@/lib/hooks/useSessionAssesment"
import { 
  SurveyList,
  CreateSurveyForm,
  ViewSurveyDetails,
  EditSurveyForm,
  AddQuestionForm
} from "./survey/index"

interface SurveyComponentProps {
  trainingId: string
}

export function SurveyComponent({ trainingId }: SurveyComponentProps) {
  const router = useRouter()
  const params = useParams()
  
  // UI state
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view' | 'edit' | 'add-question'>('list')
  const [currentSurveyId, setCurrentSurveyId] = useState<string | null>(null)
  
  // Fetch existing surveys for this training
  const { 
    data: surveyData, 
    isLoading: isLoadingSurveys,
    error: surveysError,
    refetch: refetchSurveys
  } = useSurveys(trainingId)
  
  // Fetch survey details when viewing or editing
  const { 
    data: surveyDetailData, 
    isLoading: isLoadingSurveyDetails,
    refetch: refetchSurveyDetails
  } = useSurveyDetail(currentSurveyId || "", undefined)
  
  // Mutation hooks
  const { createSurvey, isLoading: isCreatingSurvey } = useCreateSurvey(trainingId)
  const { deleteSurvey, isLoading: isDeletingSurvey } = useDeleteSurvey()
  const { updateSurvey, isLoading: isUpdatingSurvey } = useUpdateSurvey()
  const { addQuestion, isLoading: isAddingQuestion } = useAddQuestionToSurvey()

  // Extract survey data
  const surveys = surveyData?.surveys || []
  const surveyDetail = surveyDetailData?.survey

  // Handle state transitions
  const handleCreateNew = () => {
    setViewMode('create')
    setCurrentSurveyId(null)
  }

  const handleViewSurvey = (surveyId: string) => {
    setViewMode('view')
    setCurrentSurveyId(surveyId)
  }

  const handleEditSurvey = (surveyId: string) => {
    setViewMode('edit')
    setCurrentSurveyId(surveyId)
  }

  const handleAddQuestion = (surveyId: string) => {
    setViewMode('add-question')
    setCurrentSurveyId(surveyId)
  }

  const handleBackToList = () => {
    setViewMode('list')
    setCurrentSurveyId(null)
  }

  const handleBackToView = () => {
    if (currentSurveyId) {
      setViewMode('view')
    } else {
      handleBackToList()
    }
  }

  // Form submission handlers
  const handleCreateSubmit = (data: { name: string; description: string; surveyQuestions: SurveyQuestion[] }) => {
    createSurvey(data, {
      onSuccess: () => {
        refetchSurveys()
        handleBackToList()
      }
    })
  }

  const handleUpdateSubmit = (data: { surveyId: string; data: { name: string; description: string } }) => {
    updateSurvey(data, {
      onSuccess: () => {
        refetchSurveys()
        refetchSurveyDetails()
        handleBackToView()
      }
    })
  }

  const handleAddQuestionSubmit = (data: { surveyId: string; questionData: SurveyQuestion }) => {
    addQuestion(data, {
      onSuccess: () => {
        refetchSurveyDetails()
        handleBackToView()
      }
    })
  }

  const handleDeleteSurvey = (surveyId: string) => {
    deleteSurvey(surveyId, {
      onSuccess: () => {
        refetchSurveys()
      }
    })
  }

  // Loading state
  if (isLoadingSurveys) {
    return <Loading />
  }

  // Error state
  if (surveysError) {
    return (
      <div className="px-[7%] py-8">
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Surveys</h3>
          <p className="text-gray-600">
            There was a problem loading the surveys. Please try again later.
          </p>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={() => refetchSurveys()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Show loading when fetching survey details
  if ((viewMode === 'view' || viewMode === 'edit') && isLoadingSurveyDetails) {
    return <Loading />
  }

  // Render different views based on state
  switch (viewMode) {
    case 'create':
      return (
        <CreateSurveyForm
          onCancel={handleBackToList}
          onSubmit={handleCreateSubmit}
          isSubmitting={isCreatingSurvey}
        />
      )
    
    case 'view':
      if (!surveyDetail) return <Loading />
      return (
        <ViewSurveyDetails
          surveyDetail={surveyDetail}
          onBackToList={handleBackToList}
          onEditSurvey={handleEditSurvey}
          onAddQuestion={handleAddQuestion}
          onRefreshDetails={refetchSurveyDetails}
        />
      )
    
    case 'edit':
      if (!surveyDetail) return <Loading />
      return (
        <EditSurveyForm
          surveyId={surveyDetail.id}
          initialName={surveyDetail.name}
          initialDescription={surveyDetail.description}
          onCancel={handleBackToView}
          onSubmit={handleUpdateSubmit}
          isSubmitting={isUpdatingSurvey}
        />
      )
    
    case 'add-question':
      if (!currentSurveyId) return <Loading />
      return (
        <AddQuestionForm
          surveyId={currentSurveyId}
          onCancel={handleBackToView}
          onSubmit={handleAddQuestionSubmit}
          isSubmitting={isAddingQuestion}
        />
      )
    
    case 'list':
    default:
      return (
        <SurveyList
          surveys={surveys}
          onCreateNew={handleCreateNew}
          onViewSurvey={handleViewSurvey}
          onEditSurvey={handleEditSurvey}
          onDeleteSurvey={handleDeleteSurvey}
          isDeletingSurvey={isDeletingSurvey}
        />
      )
  }
}
