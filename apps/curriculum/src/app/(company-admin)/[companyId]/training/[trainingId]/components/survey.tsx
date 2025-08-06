"use client"

import { useState } from "react"
import { Loading } from "@/components/ui/loading"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  useCreateSurvey, 
  useSurveys,
  useSurveyDetail,
  useUpdateSurvey,
  useDeleteSurvey,


  CreateSurveyData,
  SurveyType
} from "@/lib/hooks/useSurvey"
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
  
  // UI state
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view' | 'edit'>('list')
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

  const handleEditSurveyStructure = (surveyId: string, options?: {
    focusSection?: {
      sectionId?: string
      action: 'add-question' | 'add-section'
    }
  }) => {
    setViewMode('create')
    setCurrentSurveyId(surveyId)
    setFocusSection(options?.focusSection)
  }

  const [focusSection, setFocusSection] = useState<{
    sectionId?: string
    action: 'add-question' | 'add-section'
  } | undefined>(undefined)



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
  const handleCreateSubmit = (data: CreateSurveyData) => {
    createSurvey(data, {
      onSuccess: () => {
        refetchSurveys()
        handleBackToList()
      }
    })
  }

  const handleUpdateSubmit = (data: { surveyId: string; data: { name: string; type: SurveyType; description: string } }) => {
    updateSurvey(data, {
      onSuccess: () => {
        refetchSurveys()
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
          onCancel={() => {
            handleBackToList()
            setFocusSection(undefined) // Clear focus when canceling
          }}
          onSubmit={handleCreateSubmit}
          isSubmitting={isCreatingSurvey}
          editingSurveyId={currentSurveyId || undefined}
          initialSurveyName={surveyDetail?.name}
          initialSurveyType={surveyDetail?.type || undefined}
          initialSurveyDescription={surveyDetail?.description}
          focusSection={focusSection}
        />
      )
    
    case 'view':
      if (!surveyDetail) return <Loading />
      return (
        <ViewSurveyDetails
          surveyDetail={surveyDetail}
          onBackToList={handleBackToList}
          onEditSurvey={handleEditSurvey}
          onEditSurveyStructure={handleEditSurveyStructure}
          onRefreshDetails={refetchSurveyDetails}
        />
      )
    
    case 'edit':
      if (!surveyDetail) return <Loading />
      return (
        <EditSurveyForm
          surveyId={surveyDetail.id}
          initialName={surveyDetail.name}
          initialType={surveyDetail.type || 'OTHER'}
          initialDescription={surveyDetail.description}
          onCancel={handleBackToView}
          onSubmit={handleUpdateSubmit}
          isSubmitting={isUpdatingSurvey}
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
