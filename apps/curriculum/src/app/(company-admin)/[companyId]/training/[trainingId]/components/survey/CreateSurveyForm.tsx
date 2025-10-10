"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  CreateSurveyData, 
  CreateSurveySection, 
  CreateSurveyEntry, 
  UpdateSurveyEntryData,
  QuestionType,
  SurveyType,
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
      // new fields for update tracking
      updatedQuestions?: { 
        sectionIndex: number; 
        questionIndex: number; 
        questionId: string; 
        updates: Partial<UpdateSurveyEntryData>;
        changeType: string;
      }[]
      updatedSectionTitles?: { sectionIndex: number; sectionId: string; title: string }[]
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
  onDeleteQuestion?: (questionId: string, onSuccess?: () => void) => void
  onDeleteSection?: (sectionId: string) => void
  onRefreshSurveyData?: () => void
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
  onDeleteSection,
  onRefreshSurveyData
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
      description: "",
      surveyEntries: [
        {
          question: "",
          questionImage: undefined,
          questionType: "RADIO",
          choices: [{ choice: "" }, { choice: "" }],
          allowTextAnswer: false,
          rows: [],
          required: true,
          followUp: false,
          questionNumber: 1
        }
      ]
    }
  ])
  
  // Change tracking for edit mode
  const [sectionsLoaded, setSectionsLoaded] = useState(false)
  const [originalSectionsCount, setOriginalSectionsCount] = useState(0)
  const [originalQuestionCounts, setOriginalQuestionCounts] = useState<number[]>([])
  const [originalSectionsSnapshot, setOriginalSectionsSnapshot] = useState<CreateSurveySection[]>([])
  
  // Navigation state
  const [selectedSection, setSelectedSection] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [editMode, setEditMode] = useState<'survey' | 'question'>('survey')

  // Fetch existing survey sections if in edit mode
  const { 
    data: existingSectionsData
  } = useSurveySections(editingSurveyId || "")

  // Helper function to calculate the next question number
  const getNextQuestionNumber = useCallback((sectionsSnapshot?: CreateSurveySection[]) => {
    const currentSections = sectionsSnapshot || sections;
    
    if (isEditMode && existingSectionsData?.sections) {
      // Count all existing questions (including follow-ups)
      let totalQuestions = existingSectionsData.sections.reduce((count, section) => 
        count + (section.questions?.length || 0), 0
      );
      // Add any new questions that have been added in current session
      totalQuestions += currentSections.reduce((count, section, idx) => {
        const originalCount = originalQuestionCounts[idx] || 0;
        const newQuestionsInSection = Math.max(0, section.surveyEntries.length - originalCount);
        return count + newQuestionsInSection;
      }, 0);
      return totalQuestions + 1;
    } else {
      // Create mode: just count current sections
      return currentSections.reduce((count, section) => count + section.surveyEntries.length, 0) + 1;
    }
  }, [sections, isEditMode, existingSectionsData?.sections, originalQuestionCounts]);

  // Track the last loaded data to detect changes
  const [lastLoadedDataHash, setLastLoadedDataHash] = useState<string>("")

  // Load existing sections when data is available or updated
  useEffect(() => {
    if (isEditMode && existingSectionsData?.sections) {
      // Create a simple hash of the data to detect changes
      const dataHash = JSON.stringify(existingSectionsData.sections.map(s => ({
        id: s.id,
        title: s.title,
        questions: s.questions.map(q => ({
          id: q.id,
          question: q.question,
          choices: q.choices
        }))
      })))
      
      // Only update if this is the first load or if the data has actually changed
      if (!sectionsLoaded || (sectionsLoaded && dataHash !== lastLoadedDataHash)) {
      // Convert existing sections to CreateSurveySection format
      const convertedSections: CreateSurveySection[] = existingSectionsData.sections.map(section => ({
        title: section.title,
        description: section.description || "",
        surveyEntries: section.questions.map(question => ({
          question: question.question,
          questionImage: question.questionImageUrl || undefined,
          questionType: question.questionType,
          choices: (question.choices || []).map(c => ({ 
            choice: typeof c === 'string' ? c : (c?.choiceText || ''),
            choiceImage: typeof c === 'string' ? undefined : c?.choiceImageUrl
          })),
          allowTextAnswer: question.allowMultipleAnswers, // Convert back to create format
          rows: question.rows,
          required: question.required,
          // Map follow-up fields from API response
          questionNumber: question.questionNumber,
          followUp: question.followUp || false,
          parentQuestionNumber: question.parentQuestionNumber || undefined,
          parentChoice: question.parentChoice || undefined
        }))
      }))

      // Track original counts for change detection BEFORE adding focus section items
      setOriginalSectionsCount(convertedSections.length)
      setOriginalQuestionCounts(convertedSections.map(section => section.surveyEntries.length))
      setOriginalSectionsSnapshot(convertedSections.map(s => ({ 
        title: s.title, 
        description: s.description,
        surveyEntries: s.surveyEntries.map(e => ({...e})) 
      })))

      // Handle focus section logic AFTER tracking original counts
      if (focusSection?.action === 'add-question' && focusSection.sectionId) {
        // Find the specific section and add a new question to it
        const sectionIndex = existingSectionsData.sections.findIndex(s => s.id === focusSection.sectionId)
        if (sectionIndex !== -1) {
          convertedSections[sectionIndex].surveyEntries.push({
            question: "",
            questionImage: undefined,
            questionType: "TEXT",
            choices: [],
            allowTextAnswer: false,
            rows: [],
            required: true,
            followUp: false,
            questionNumber: getNextQuestionNumber(convertedSections)
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
          description: "",
          surveyEntries: [{
            question: "",
            questionImage: undefined,
            questionType: "TEXT",
            choices: [],
            allowTextAnswer: false,
            rows: [],
            required: true,
            followUp: false,
            questionNumber: getNextQuestionNumber(convertedSections)
          }]
        })
        setSelectedSection(convertedSections.length - 1)
        setSelectedQuestion(0)
        setEditMode('question') // Switch to question editing mode
      }

        setSections(convertedSections)
        setSectionsLoaded(true)
        setLastLoadedDataHash(dataHash)
      }
    }
  }, [existingSectionsData, isEditMode, sectionsLoaded, focusSection, getNextQuestionNumber, lastLoadedDataHash])

  // Hook for adding sections to existing surveys
  const { isLoading: isAddingSection } = useAddSectionToSurvey()

  // Section management functions
  const addSection = () => {
    setSections(prev => [...prev, {
      title: "",
      description: "",
      surveyEntries: [{
        question: "",
        questionImage: undefined,
        questionType: "RADIO",
        choices: [{ choice: "" }, { choice: "" }],
        allowTextAnswer: false,
        rows: [],
        required: true,
        followUp: false,
        questionNumber: getNextQuestionNumber()
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

  const updateSectionDescription = (sectionIndex: number, description: string) => {
    setSections(prev => prev.map((section, i) => 
      i === sectionIndex ? { ...section, description } : section
    ))
  }

  // Question management functions
  const addQuestion = (sectionIndex: number) => {
    setSections(prev => {
      const nextQuestionNumber = getNextQuestionNumber(prev);
      return prev.map((section, i) => 
        i === sectionIndex 
          ? { 
              ...section, 
              surveyEntries: [...section.surveyEntries, {
                question: "",
                questionImage: undefined,
                questionType: "RADIO",
                choices: [{ choice: "" }, { choice: "" }],
                allowTextAnswer: false,
                rows: [],
                required: true,
                followUp: false,
                questionNumber: nextQuestionNumber
              }]
            }
          : section
      );
    })
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
        onDeleteQuestion(questionId, () => {
          // After successful deletion, update local state and navigate properly
          removeQuestion(sectionIndex, questionIndex)
          
          // Navigate to a valid question or back to survey mode
          const section = sections[sectionIndex]
          if (section && section.surveyEntries.length > 1) {
            // Navigate to previous question if available, otherwise first question
            const newQuestionIndex = questionIndex > 0 ? questionIndex - 1 : 0
            setSelectedQuestion(newQuestionIndex)
          } else if (sections.length > 0) {
            // If no questions left in section, go to survey mode
            setEditMode('survey')
          }
        })
      }
    } else {
      // This is a new question, just remove from local state
      removeQuestion(sectionIndex, questionIndex)
      
      // Navigate to a valid question or back to survey mode
      const section = sections[sectionIndex]
      if (section && section.surveyEntries.length > 1) {
        // Navigate to previous question if available, otherwise first question
        const newQuestionIndex = questionIndex > 0 ? questionIndex - 1 : 0
        setSelectedQuestion(newQuestionIndex)
      } else if (sections.length > 0) {
        // If no questions left in section, go to survey mode
        setEditMode('survey')
      }
    }
  }



  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<CreateSurveyEntry>) => {
    setSections(prev => {
      const newSections = prev.map((section, i) => 
        i === sectionIndex 
          ? { 
              ...section, 
              surveyEntries: section.surveyEntries.map((entry, qI) => 
                qI === questionIndex ? { ...entry, ...updates } : entry
              )
            }
          : section
      );
      return newSections;
    });
  }

  // Compute changed items for edit mode
  const editChanges = useMemo(() => {
    if (!isEditMode || !existingSectionsData?.sections) return null
    const updatedSectionTitles: { sectionIndex: number; sectionId: string; title: string; description?: string }[] = []
    const updatedQuestions: { 
      sectionIndex: number; 
      questionIndex: number; 
      questionId: string; 
      updates: Partial<UpdateSurveyEntryData>;
      changeType: string;
    }[] = []

    // Existing sections only
    for (let i = 0; i < Math.min(originalSectionsCount, sections.length); i++) {
      const current = sections[i]
      const original = originalSectionsSnapshot[i]
      const existingSection = existingSectionsData.sections[i]
      // Section title or description change
      const titleChanged = current?.title !== original?.title
      const descriptionChanged = current?.description !== original?.description
      
      if ((titleChanged || descriptionChanged) && existingSection?.id) {
        updatedSectionTitles.push({ 
          sectionIndex: i, 
          sectionId: existingSection.id, 
          title: current.title,
          description: current.description
        })
      }
      // Questions inside existing section (only up to original count; extras are handled as new)
      const originalQCount = originalQuestionCounts[i] || 0
      for (let q = 0; q < Math.min(originalQCount, current.surveyEntries.length); q++) {
        const currQ = current.surveyEntries[q]
        const origQ = original.surveyEntries[q]
        const existingQ = existingSection?.questions[q]
        if (!existingQ?.id) continue
        // Detect all changes for this question and combine into single update
        const questionChanges: Partial<UpdateSurveyEntryData> = {}
        const changeTypes: string[] = []
        let hasChanges = false
        
        // Check question text change
        if (currQ.question !== origQ.question) {
          questionChanges.question = currQ.question
          changeTypes.push('text')
          hasChanges = true
        }
        
        // Check question image change
        if (currQ.questionImage !== origQ.questionImage || currQ.questionImageFile !== origQ.questionImageFile) {
          questionChanges.questionImage = currQ.questionImage
          questionChanges.questionImageFile = currQ.questionImageFile
          changeTypes.push('image')
          hasChanges = true
        }
        
        // Check required field change
        if (currQ.required !== origQ.required) {
          questionChanges.isRequired = currQ.required
          changeTypes.push('required')
          hasChanges = true
        }
        
        // Check question type change (send type + choices since old choices get cleared)
        if (currQ.questionType !== origQ.questionType) {
          questionChanges.questionType = currQ.questionType as QuestionType
          questionChanges.choices = (currQ.choices || []).map((c) => ({
            choice: (c as unknown as { choice?: string }).choice ?? (c as unknown as string) ?? "",
            choiceImage: (c as unknown as { choiceImage?: string }).choiceImage,
            choiceImageFile: (c as unknown as { choiceImageFile?: File }).choiceImageFile
          }))
          changeTypes.push('type')
          hasChanges = true
        }
        
        // Check rows change (for GRID questions)
        if (JSON.stringify(currQ.rows) !== JSON.stringify(origQ.rows)) {
          questionChanges.rows = currQ.rows
          changeTypes.push('rows')
          hasChanges = true
        }
        
        // Check allow other answer change
        if (currQ.allowTextAnswer !== origQ.allowTextAnswer) {
          questionChanges.allowOtherAnswer = currQ.allowTextAnswer ?? false
          changeTypes.push('allowOther')
          hasChanges = true
        }
        
        // Check follow-up field changes
        if (currQ.followUp !== origQ.followUp) {
          questionChanges.isFollowUp = currQ.followUp ?? false
          changeTypes.push('followUp')
          hasChanges = true
        }
        
        // Check parent question number change
        if (currQ.parentQuestionNumber !== origQ.parentQuestionNumber) {
          questionChanges.parentQuestionNumber = currQ.parentQuestionNumber
          changeTypes.push('parentQuestion')
          hasChanges = true
        }
        
        // Check parent choice change
        if (currQ.parentChoice !== origQ.parentChoice) {
          questionChanges.parentChoice = currQ.parentChoice
          changeTypes.push('parentChoice')
          hasChanges = true
        }
        
        // If any changes detected, create single combined update
        if (hasChanges) {
          updatedQuestions.push({
            sectionIndex: i,
            questionIndex: q,
            questionId: existingQ.id,
            updates: questionChanges,
            changeType: changeTypes.join('+') // Combined change types like "text+image+required"
          })
        }
      }
    }

    // Detect newly added sections
    const newSections = sections.length > originalSectionsCount ? sections.slice(originalSectionsCount) : []

    // Detect new questions in existing sections
    const newQuestionsPerSection: { sectionIndex: number; sectionId?: string; newQuestions: CreateSurveyEntry[] }[] = []
    for (let i = 0; i < Math.min(originalSectionsCount, sections.length); i++) {
      const current = sections[i]
      const originalQCount = originalQuestionCounts[i] || 0
      if (current.surveyEntries.length > originalQCount) {
        const extras = current.surveyEntries.slice(originalQCount)
        const sectionId = existingSectionsData.sections[i]?.id
        newQuestionsPerSection.push({ sectionIndex: i, sectionId, newQuestions: extras })
      }
    }

    return { updatedSectionTitles, updatedQuestions, newSections, newQuestionsPerSection }
  }, [isEditMode, sections, originalSectionsCount, originalQuestionCounts, originalSectionsSnapshot, existingSectionsData])

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
        // enforce: first question in a section can't be follow-up
        if (questionIndex === 0 && question.followUp) {
          toast.message(`Disabled follow-up for first question in "${section.title}"`)
          setSections(prev => prev.map((s, i) => i === sectionIndex ? {
            ...s,
            surveyEntries: s.surveyEntries.map((e, qi) => qi === questionIndex ? { ...e, followUp: false, parentQuestionNumber: undefined, parentChoice: undefined } : e)
          } : s))
        }
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
    const changes = isEditMode ? editChanges : null

    // Calculate starting counter for new questions in edit mode
    let globalCounter = 1;
    if (isEditMode) {
      // Find the highest existing question number to continue from
      const maxExistingNumber = sections.reduce((max, sec, sectionIndex) => {
        if (sectionIndex >= originalSectionsCount) return max;
        return sec.surveyEntries.reduce((sectionMax, entry, questionIndex) => {
          if (questionIndex >= (originalQuestionCounts[sectionIndex] || 0)) return sectionMax;
          return Math.max(sectionMax, entry.questionNumber || 0);
        }, max);
      }, 0);
      globalCounter = maxExistingNumber + 1;
    }
    
    const normalizedSections: CreateSurveySection[] = sections.map((sec, sectionIndex) => ({
      title: sec.title,
      surveyEntries: sec.surveyEntries.map((entry, questionIndex) => {
        // In edit mode, preserve existing question numbers for existing questions
        let questionNumber: number;
        if (isEditMode && 
            sectionIndex < originalSectionsCount && 
            questionIndex < (originalQuestionCounts[sectionIndex] || 0)) {
          // This is an existing question, preserve its original questionNumber
          questionNumber = entry.questionNumber || 1;
        } else {
          // This is a new question, assign next available number
          questionNumber = globalCounter++;
        }
        
        return {
          ...entry,
          questionNumber,
          choices: (entry.choices || []).map(c => ({ 
            choice: c.choice, 
            choiceImage: c.choiceImage,
            choiceImageFile: c.choiceImageFile  // ✅ PRESERVE FILE!
          }))
        }
      })
    }))

    onSubmit({
      name: surveyName,
      type: surveyType,
      description: surveyDescription,
      sections: normalizedSections,
      ...(isEditMode && changes && {
        editMetadata: {
          newSections: changes.newSections,
          newQuestionsPerSection: changes.newQuestionsPerSection,
          updatedQuestions: changes.updatedQuestions,
          updatedSectionTitles: changes.updatedSectionTitles,
        },
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
              onUpdateSectionDescription={updateSectionDescription}
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
                      isFirstInSection={selectedQuestion === 0}
                      isEditMode={isEditMode}
                      surveyEntryId={
                        isEditMode && 
                        selectedSection < originalSectionsCount && 
                        selectedQuestion < (originalQuestionCounts[selectedSection] || 0) 
                          ? existingSectionsData?.sections[selectedSection]?.questions[selectedQuestion]?.id
                          : undefined
                      }
                      onRefreshSurveyData={onRefreshSurveyData}
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