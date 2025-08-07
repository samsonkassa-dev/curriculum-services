"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  CreateSurveyData, 
  CreateSurveySection, 
  CreateSurveyEntry, 
  SurveyType,
  getDefaultQuestionFields,
  validateCreateSurveyEntry,
  useSurveySections,
  useAddSectionToSurvey
} from "@/lib/hooks/useSurvey"
import { toast } from "sonner"

// Import the new components
import { SurveySettings } from "./components/SurveySettings"
import { SurveyNavigation } from "./components/SurveyNavigation"
import { QuestionPreview } from "./components/QuestionPreviews"
import { SingleQuestionEditor } from "./components/SingleQuestionEditor"

interface CreateSurveyFormProps {
  onCancel: () => void
  onSubmit: (data: CreateSurveyData & { 
    editMetadata?: {
      newSections: CreateSurveySection[]
      newQuestionsPerSection: { sectionIndex: number; sectionId?: string; newQuestions: CreateSurveyEntry[] }[]
    }
  }) => void
  isSubmitting: boolean
  editingSurveyId?: string // Optional - if provided, we're in edit mode
  initialSurveyName?: string
  initialSurveyType?: SurveyType
  initialSurveyDescription?: string
  focusSection?: {
    sectionId?: string // If provided, focus on this section for adding questions
    action: 'add-question' | 'add-section' | 'edit-questions' // Whether to add question, new section, or edit existing questions
  }
  onDeleteQuestion?: (questionId: string) => void
  onDeleteSection?: (sectionId: string) => void
}

export function CreateSurveyForm({
  onCancel,
  onSubmit,
  isSubmitting,
  editingSurveyId,
  initialSurveyName = "",
  initialSurveyType = "BASELINE",
  initialSurveyDescription = "",
  focusSection,
  onDeleteQuestion,
  onDeleteSection
}: CreateSurveyFormProps) {
  const isEditMode = !!editingSurveyId
  
  // Survey basic info state
  const [surveyName, setSurveyName] = useState(initialSurveyName)
  const [surveyType, setSurveyType] = useState<SurveyType>(initialSurveyType)
  const [surveyDescription, setSurveyDescription] = useState(initialSurveyDescription)
  
  // Sections and questions state
  const [sections, setSections] = useState<CreateSurveySection[]>([
    {
      title: "",
      surveyEntries: [
        {
          question: "",
          questionType: "RADIO",
          choices: ["", ""],
          allowTextAnswer: false,
          rows: [],
          required: true
        }
      ]
    }
  ])
  
  // Change tracking for edit mode
  const [sectionsLoaded, setSectionsLoaded] = useState(false)
  const [originalSectionsCount, setOriginalSectionsCount] = useState(0)
  const [originalQuestionCounts, setOriginalQuestionCounts] = useState<number[]>([])
  
  // Navigation state
  const [selectedSection, setSelectedSection] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [editMode, setEditMode] = useState<'survey' | 'question'>('survey')

  // Fetch existing survey sections if in edit mode
  const { 
    data: existingSectionsData, 
    isLoading: isLoadingExisting 
  } = useSurveySections(editingSurveyId || "")

  // Load existing sections when data is available
  useEffect(() => {
    if (isEditMode && existingSectionsData?.sections && !sectionsLoaded) {
      // Convert existing sections to CreateSurveySection format
      const convertedSections: CreateSurveySection[] = existingSectionsData.sections.map(section => ({
        title: section.title,
        surveyEntries: section.questions.map(question => ({
          question: question.question,
          questionType: question.questionType,
          choices: question.choices,
          allowTextAnswer: question.allowMultipleAnswers, // Convert back to create format
          rows: question.rows,
          required: question.required
        }))
      }))

      // Track original counts for change detection BEFORE adding focus section items
      setOriginalSectionsCount(convertedSections.length)
      setOriginalQuestionCounts(convertedSections.map(section => section.surveyEntries.length))

      // Handle focus section logic AFTER tracking original counts
      if (focusSection?.action === 'add-question' && focusSection.sectionId) {
        // Find the specific section and add a new question to it
        const sectionIndex = existingSectionsData.sections.findIndex(s => s.id === focusSection.sectionId)
        if (sectionIndex !== -1) {
          convertedSections[sectionIndex].surveyEntries.push({
            question: "",
            questionType: "TEXT",
            choices: [],
            allowTextAnswer: false,
            rows: [],
            required: true
          })
          setSelectedSection(sectionIndex)
          setSelectedQuestion(convertedSections[sectionIndex].surveyEntries.length - 1)
          setEditMode('question') // Switch to question editing mode
        }
      } else if (focusSection?.action === 'edit-questions' && focusSection.sectionId) {
        // Find the specific section and focus on its first question
        const sectionIndex = existingSectionsData.sections.findIndex(s => s.id === focusSection.sectionId)
        if (sectionIndex !== -1 && convertedSections[sectionIndex].surveyEntries.length > 0) {
          setSelectedSection(sectionIndex)
          setSelectedQuestion(0) // Focus on first question
          setEditMode('question') // Switch to question editing mode
        }
      } else if (focusSection?.action === 'add-section') {
        // Add a new empty section
        convertedSections.push({
          title: "",
          surveyEntries: [{
            question: "",
            questionType: "TEXT",
            choices: [],
            allowTextAnswer: false,
            rows: [],
            required: true
          }]
        })
        setSelectedSection(convertedSections.length - 1)
        setSelectedQuestion(0)
        setEditMode('question') // Switch to question editing mode
      }

      setSections(convertedSections)
      setSectionsLoaded(true)
    }
  }, [existingSectionsData, isEditMode, sectionsLoaded, focusSection])

  // Hook for adding sections to existing surveys
  const { addSection: addSectionToSurvey, isLoading: isAddingSection } = useAddSectionToSurvey()

  // Section management functions
  const addSection = () => {
    setSections(prev => [...prev, {
      title: "",
      surveyEntries: [{
        question: "",
        questionType: "RADIO",
        choices: ["", ""],
        allowTextAnswer: false,
        rows: [],
        required: true
      }]
    }])
  }

  const removeSection = (sectionIndex: number) => {
    setSections(prev => prev.filter((_, i) => i !== sectionIndex))
  }

  const handleDeleteSection = (sectionIndex: number) => {
    if (isEditMode && sectionIndex < originalSectionsCount) {
      // This is an existing section, call API to delete
      const sectionId = existingSectionsData?.sections[sectionIndex]?.id
      if (sectionId && onDeleteSection) {
        onDeleteSection(sectionId)
      }
    } else {
      // This is a new section, just remove from local state
      removeSection(sectionIndex)
    }
  }

  const updateSectionTitle = (sectionIndex: number, title: string) => {
    setSections(prev => prev.map((section, i) => 
      i === sectionIndex ? { ...section, title } : section
    ))
  }

  // Question management functions
  const addQuestion = (sectionIndex: number) => {
    setSections(prev => prev.map((section, i) => 
      i === sectionIndex 
        ? { 
            ...section, 
            surveyEntries: [...section.surveyEntries, {
              question: "",
              questionType: "RADIO",
              choices: ["", ""],
              allowTextAnswer: false,
              rows: [],
              required: true
            }]
          }
        : section
    ))
  }

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    setSections(prev => prev.map((section, i) => 
      i === sectionIndex 
        ? { 
            ...section, 
            surveyEntries: section.surveyEntries.filter((_, qI) => qI !== questionIndex)
          }
        : section
    ))
  }

  const handleDeleteQuestion = (sectionIndex: number, questionIndex: number) => {
    if (isEditMode && 
        sectionIndex < originalSectionsCount && 
        questionIndex < (originalQuestionCounts[sectionIndex] || 0)) {
      // This is an existing question, call API to delete
      const questionId = existingSectionsData?.sections[sectionIndex]?.questions[questionIndex]?.id
      if (questionId && onDeleteQuestion) {
        onDeleteQuestion(questionId)
      }
    } else {
      // This is a new question, just remove from local state
      removeQuestion(sectionIndex, questionIndex)
    }
  }

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<CreateSurveyEntry>) => {
    setSections(prev => prev.map((section, i) => 
      i === sectionIndex 
        ? { 
            ...section, 
            surveyEntries: section.surveyEntries.map((entry, qI) => 
              qI === questionIndex ? { ...entry, ...updates } : entry
            )
          }
        : section
    ))
  }

  // Navigation functions
  const selectSurveySettings = () => {
    setEditMode('survey')
  }

  const selectQuestion = (sectionIndex: number, questionIndex: number) => {
    setSelectedSection(sectionIndex)
    setSelectedQuestion(questionIndex)
    setEditMode('question')
  }

  // Form validation
  const validateForm = () => {
    if (!surveyName.trim()) {
      toast.error("Survey name is required")
      return false
    }

    if (sections.length === 0) {
      toast.error("At least one section is required")
      return false
    }

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex]
      
      if (!section.title.trim()) {
        toast.error(`Section ${sectionIndex + 1} title is required`)
        return false
      }

      if (section.surveyEntries.length === 0) {
        toast.error(`Section "${section.title}" must have at least one question`)
        return false
      }

      for (let questionIndex = 0; questionIndex < section.surveyEntries.length; questionIndex++) {
        const question = section.surveyEntries[questionIndex]
        const validation = validateCreateSurveyEntry(question)
        
        if (!validation.isValid) {
          toast.error(`Section "${section.title}", Question ${questionIndex + 1}: ${validation.errors[0]}`)
          return false
        }
      }
    }

    return true
  }

  // Form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    // In edit mode, we need to detect what's new and pass that information
    let newSections: CreateSurveySection[] = []
    const newQuestionsPerSection: { sectionIndex: number; sectionId?: string; newQuestions: CreateSurveyEntry[] }[] = []
    
    if (isEditMode) {
      // Detect new sections (sections beyond the original count)
      if (sections.length > originalSectionsCount) {
        newSections = sections.slice(originalSectionsCount)
      }
      
      // Detect new questions in existing sections
      sections.forEach((section, sectionIndex) => {
        if (sectionIndex < originalSectionsCount) { // Only check existing sections
          const originalQuestionCount = originalQuestionCounts[sectionIndex] || 0
          if (section.surveyEntries.length > originalQuestionCount) {
            const newQuestions = section.surveyEntries.slice(originalQuestionCount)
            const sectionId = existingSectionsData?.sections[sectionIndex]?.id
            
            newQuestionsPerSection.push({
              sectionIndex,
              sectionId,
              newQuestions
            })
          }
        }
      })
    }

    onSubmit({
      name: surveyName,
      type: surveyType,
      description: surveyDescription,
      sections: sections,
      // Pass additional metadata for edit mode
      ...(isEditMode && {
        editMetadata: {
          newSections,
          newQuestionsPerSection
        }
      })
    })
  }

  const currentQuestion = sections[selectedSection]?.surveyEntries[selectedQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-[7%] py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Survey Structure' : 'Create New Survey'}
            </h2>
            <p className="text-gray-600 mt-1">
              {editMode === 'survey' 
                ? (isEditMode ? 'Configure survey settings and manage sections' : 'Configure survey settings and basic information')
                : `Editing ${sections[selectedSection]?.title || `Section ${selectedSection + 1}`} - Question ${selectedQuestion + 1}`
              }
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="px-6">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6"
              disabled={isSubmitting || isAddingSection}
            >
              {isEditMode 
                ? (isAddingSection ? "Adding..." : "Save Changes")
                : (isSubmitting ? "Creating..." : "Create Survey")
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-[7%] py-8">
        <div className="grid grid-cols-12 gap-8 max-w-full">
          {/* Left Sidebar - Navigation */}
          <div className="col-span-3">
            <SurveyNavigation
              sections={sections}
              selectedSection={selectedSection}
              selectedQuestion={selectedQuestion}
              editMode={editMode}
              surveyName={surveyName}
              surveyType={surveyType}
              isEditMode={isEditMode}
              originalSectionsCount={originalSectionsCount}
              onSelectSurveySettings={selectSurveySettings}
              onSelectQuestion={selectQuestion}
              onUpdateSectionTitle={updateSectionTitle}
              onDeleteSection={handleDeleteSection}
              onDeleteQuestion={handleDeleteQuestion}
              onAddQuestion={addQuestion}
              onAddSection={addSection}
            />
          </div>

          {/* Main Content Area */}
          <div className="col-span-6">
            <Card>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">
                  {editMode === 'survey' ? 'Survey Settings' : 'Question Editor'}
                </h3>
              </div>
              
              <div className="p-6">
                {editMode === 'survey' ? (
                  <SurveySettings
                    surveyName={surveyName}
                    setSurveyName={setSurveyName}
                    surveyType={surveyType}
                    setSurveyType={setSurveyType}
                    surveyDescription={surveyDescription}
                    setSurveyDescription={setSurveyDescription}
                    isEditMode={isEditMode}
                  />
                ) : (
                  currentQuestion && (
                    <SingleQuestionEditor
                      question={currentQuestion}
                      onUpdateQuestion={(updates) => updateQuestion(selectedSection, selectedQuestion, updates)}
                    />
                  )
                )}
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Preview */}
          <div className="col-span-3">
            {editMode === 'question' && currentQuestion && (
              <QuestionPreview question={currentQuestion} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}