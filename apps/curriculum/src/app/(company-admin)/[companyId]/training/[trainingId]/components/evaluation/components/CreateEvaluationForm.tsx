"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { EvaluationEditorProvider, useEvaluationEditor } from "./EvaluationEditorContext"
import { EvaluationSettings } from "./EvaluationSettings"
import { EvaluationNavigation } from "./EvaluationNavigation"
import { SingleEvaluationQuestionEditor } from "./SingleEvaluationQuestionEditor"
import { EvaluationQuestionPreview } from "./EvaluationQuestionPreview"
import { ReadOnlyEvaluationQuestionView } from "./ReadOnlyEvaluationQuestionView"
import { 
  EvaluationFormType, 
  EvaluationSectionForm, 
  EvaluationEntryForm,
  EvaluationChoiceForm,
  CreateEvaluationPayload 
} from "@/lib/hooks/evaluation-types"
import { useCreateEvaluation } from "@/lib/hooks/useEvaluation"

// Initial State Helpers
const emptyEntry = (): EvaluationEntryForm => ({
  clientId: crypto.randomUUID(),
  question: "",
  questionType: "TEXT",
  choices: [],
  isFollowUp: false
})

const emptySection = (): EvaluationSectionForm => ({
  title: "Section 1",
  description: "",
  entries: [emptyEntry()]
})

interface CreateEvaluationFormProps {
  trainingId: string
  onCancel: () => void
}

function CreateEvaluationFormInner({ trainingId, onCancel }: CreateEvaluationFormProps) {
  // Form State
  const [formType, setFormType] = useState<EvaluationFormType>("PRE")
  const [sections, setSections] = useState<EvaluationSectionForm[]>([emptySection()])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the context for navigation and editor state
  const {
    selectedSection,
    selectedQuestion,
    editorMode,
    questionState,
    setSelectedSection,
    setSelectedQuestion,
    setEditorMode,
    startEditingQuestion,
    startCreatingQuestion,
    stopEditingQuestion,
    navigateToNewQuestion,
    navigateToNewSection,
  } = useEvaluationEditor()

  const createEvaluation = useCreateEvaluation()

  // Section management functions
  const addSection = () => {
    const newSectionIndex = sections.length
    const defaultTitle = `Section ${newSectionIndex + 1}`
    const newSection = { ...emptySection(), title: defaultTitle }
    setSections(prev => [...prev, newSection])
    navigateToNewSection(newSectionIndex)
    startCreatingQuestion()
  }

  const removeSection = (sectionIndex: number) => {
    setSections(prev => prev.filter((_, i) => i !== sectionIndex))
    if (selectedSection >= sectionIndex && selectedSection > 0) {
      setSelectedSection(selectedSection - 1)
    }
    if (sections.length <= 1) {
      setEditorMode('evaluation')
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
    const currentSection = sections[sectionIndex]
    const newQuestionIndex = currentSection.entries.length
    
    setSections(prev => prev.map((section, i) => 
      i === sectionIndex 
        ? { 
            ...section, 
            entries: [...section.entries, emptyEntry()]
          }
        : section
    ))
    
    navigateToNewQuestion(sectionIndex, newQuestionIndex)
    startCreatingQuestion()
  }

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const currentSection = sections[sectionIndex]
    const willHaveQuestions = currentSection.entries.length > 1
    
    setSections(prev => prev.map((section, i) => 
      i === sectionIndex 
        ? { 
            ...section, 
            entries: section.entries.filter((_, qI) => qI !== questionIndex)
          }
        : section
    ))
    
    // Navigate to a valid question or back to evaluation mode
    if (willHaveQuestions) {
      const newQuestionIndex = questionIndex > 0 ? questionIndex - 1 : 0
      setSelectedQuestion(newQuestionIndex)
    } else if (sections.length > 0) {
      setEditorMode('evaluation')
    }
  }

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<EvaluationEntryForm>) => {
    setSections(prev => prev.map((section, i) => 
      i === sectionIndex 
        ? { 
            ...section, 
            entries: section.entries.map((entry, qI) => 
              qI === questionIndex ? { ...entry, ...updates } : entry
            )
          }
        : section
    ))
  }

  // Navigation functions
  const selectEvaluationSettings = () => {
    setEditorMode('evaluation')
  }

  const selectQuestion = (sectionIndex: number, questionIndex: number) => {
    setSelectedSection(sectionIndex)
    setSelectedQuestion(questionIndex)
    setEditorMode('question')
    stopEditingQuestion() // Reset to viewing mode when navigating
  }

  // No longer need parent questions logic since follow-ups are choice-based

  // Form validation
  const validateForm = () => {
    if (sections.length === 0) {
      toast.error("At least one section is required")
      return false
    }

    // Build sanitized sections: drop sections with no title and no valid questions
    const sanitizedSections = sections
      .map((section) => ({
        ...section,
        entries: section.entries.filter((q) => q.question.trim())
      }))
      .filter((section) => section.title.trim() || section.entries.length > 0)

    if (sanitizedSections.length === 0) {
      toast.error("At least one section with questions is required")
      return false
    }

    for (let sectionIndex = 0; sectionIndex < sanitizedSections.length; sectionIndex++) {
      const section = sanitizedSections[sectionIndex]
      
      if (!section.title.trim()) {
        toast.error(`Section ${sectionIndex + 1} title is required`)
        return false
      }

      if (section.entries.length === 0) {
        toast.error(`Section "${section.title}" must have at least one question`)
        return false
      }

      for (let questionIndex = 0; questionIndex < section.entries.length; questionIndex++) {
        const question = section.entries[questionIndex]
        
        if (!question.question.trim()) {
          toast.error(`Section "${section.title}", Question ${questionIndex + 1}: Question text is required`)
          return false
        }

        // Validate follow-up questions
        if (question.isFollowUp) {
          if (!question.parentQuestionClientId) {
            toast.error(`Section "${section.title}", Question ${questionIndex + 1}: Parent question is required for follow-up questions`)
            return false
          }
          if (!question.triggerChoiceClientIds || question.triggerChoiceClientIds.length === 0) {
            toast.error(`Section "${section.title}", Question ${questionIndex + 1}: At least one trigger choice is required for follow-up questions`)
            return false
          }
        }

        // Validate choice-based questions
        if ((question.questionType === "RADIO" || question.questionType === "CHECKBOX") && question.choices.length === 0) {
          toast.error(`Section "${section.title}", Question ${questionIndex + 1}: At least one choice is required for choice-based questions`)
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

    setIsSubmitting(true)

    // Sanitize sections: remove empty questions and drop sections without title and questions
    const sanitizedSections = sections
      .map((section) => ({
        ...section,
        entries: section.entries.filter((q) => q.question.trim())
      }))
      .filter((section) => section.title.trim() || section.entries.length > 0)

    // Convert form data to API payload format
    // Need to flatten follow-up questions from choices into separate entries
    const allEntries: any[] = []
    
    sanitizedSections.forEach(section => {
      section.entries.forEach(entry => {
        // Add the main question
        allEntries.push({
          clientId: entry.clientId,
          question: entry.question,
          questionImage: entry.questionImage,
          questionImageFile: entry.questionImageFile, // Include File object for upload
          questionType: entry.questionType,
          choices: entry.choices.map(choice => ({
            clientId: choice.clientId,
            choiceText: choice.choiceText,
            choiceImage: choice.choiceImage,
            choiceImageFile: choice.choiceImageFile // Include File object for upload
          })),
          isFollowUp: entry.isFollowUp,
          parentQuestionClientId: entry.parentQuestionClientId,
          triggerChoiceClientIds: entry.triggerChoiceClientIds,
          parentQuestionId: entry.parentQuestionId,
          triggerChoiceIds: entry.triggerChoiceIds
        })
        
        // Add follow-up questions embedded in choices
        entry.choices.forEach(choice => {
          if (choice.hasFollowUp && choice.followUpQuestion) {
            allEntries.push({
              clientId: choice.followUpQuestion.clientId,
              question: choice.followUpQuestion.question,
              questionImage: choice.followUpQuestion.questionImage,
              questionImageFile: choice.followUpQuestion.questionImageFile, // Include File object for upload
              questionType: choice.followUpQuestion.questionType,
              choices: (choice.followUpQuestion.choices || []).map(fChoice => ({
                clientId: fChoice.clientId,
                choiceText: fChoice.choiceText,
                choiceImage: fChoice.choiceImage,
                choiceImageFile: fChoice.choiceImageFile // Include File object for upload
              })),
              isFollowUp: true,
              parentQuestionClientId: entry.clientId,
              triggerChoiceClientIds: [choice.clientId],
              // Only use server IDs if we're editing (but this is creation form, so always client IDs)
              parentQuestionId: undefined,
              triggerChoiceIds: undefined
            })
          }
        })
      })
    })

    const payload: CreateEvaluationPayload = {
      formType,
      sections: [{
        title: sanitizedSections[0]?.title || "Section 1",
        description: sanitizedSections[0]?.description || "",
        entries: allEntries
      }]
    }

    createEvaluation.mutate({ trainingId, data: payload }, {
      onSuccess: () => {
        setIsSubmitting(false)
        toast.success("Evaluation form created successfully")
        onCancel()
      },
      onError: () => {
        setIsSubmitting(false)
      }
    })
  }

  const currentQuestion = sections[selectedSection]?.entries[selectedQuestion]
  const evaluationName = `${formType} Training Evaluation`

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-white border-b w-full">
        <div className="px-[7%] py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create Evaluation Form
              </h2>
              <p className="text-gray-600 mt-1">
                {editorMode === 'evaluation' 
                  ? "Configure evaluation settings" 
                  : `Editing ${sections[selectedSection]?.title || `Section ${selectedSection + 1}`} - Question ${selectedQuestion + 1}`}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="px-6">
                Cancel
              </Button>
              
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6"
                disabled={isSubmitting || createEvaluation.isPending}
              >
                {isSubmitting || createEvaluation.isPending ? "Creating..." : "Create Evaluation"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="px-[7%] py-8">
          <div className="grid grid-cols-12 gap-8 max-w-full w-full">
            {/* Left Sidebar - Navigation */}
            <div className="col-span-3">
              <EvaluationNavigation
                sections={sections}
                selectedSection={selectedSection}
                selectedQuestion={selectedQuestion}
                editMode={editorMode}
                evaluationName={evaluationName}
                isEditMode={false}
                canAddSection={true}
                disableEvaluationSettings={false}
                onSelectEvaluationSettings={selectEvaluationSettings}
                onSelectQuestion={selectQuestion}
                onUpdateSectionTitle={updateSectionTitle}
                onUpdateSectionDescription={updateSectionDescription}
                onDeleteSection={removeSection}
                onDeleteQuestion={removeQuestion}
                onAddQuestion={addQuestion}
                onAddSection={addSection}
                onSaveSectionMeta={(idx, title, description) => {
                  setSections(prev => prev.map((s, i) => i === idx ? { ...s, title, description } : s))
                }}
                onReorderSections={(fromIdx, toIdx) => {
                  if (fromIdx === toIdx) return
                  setSections(prev => {
                    const next = [...prev]
                    const [moved] = next.splice(fromIdx, 1)
                    next.splice(toIdx, 0, moved)
                    // Adjust selection index to follow moved section naturally
                    let nextSelected = selectedSection
                    if (selectedSection === fromIdx) nextSelected = toIdx
                    else if (fromIdx < selectedSection && toIdx >= selectedSection) nextSelected = selectedSection - 1
                    else if (fromIdx > selectedSection && toIdx <= selectedSection) nextSelected = selectedSection + 1
                    setSelectedSection(Math.max(0, Math.min(next.length - 1, nextSelected)))
                    return next
                  })
                }}
              />
            </div>

            {/* Main Content Area */}
            <div className="col-span-6">
              <Card className="w-full">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">
                    {editorMode === 'evaluation' ? 'Evaluation Settings' : 'Question Editor'}
                  </h3>
                </div>
                
                <div className="p-6">
                  {editorMode === 'evaluation' ? (
                    <EvaluationSettings 
                      formType={formType} 
                      setFormType={setFormType}
                      onNext={() => {
                        setEditorMode('question')
                        if (sections.length > 0 && sections[0].entries.length > 0) {
                          setSelectedSection(0)
                          setSelectedQuestion(0)
                          startCreatingQuestion()
                        }
                      }}
                    />
                  ) : (
                    currentQuestion && (
                      <>
                        {questionState !== 'viewing' ? (
                          <SingleEvaluationQuestionEditor
                            key={`${selectedSection}-${selectedQuestion}-${currentQuestion.clientId}`}
                            question={currentQuestion}
                            onUpdateQuestion={(updates) => updateQuestion(selectedSection, selectedQuestion, updates)}
                            isCreatingNew={true} // Always creating new for this form
                          />
                        ) : (
                          <>
                            <div className="mb-4 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  Question {selectedQuestion + 1}
                                </Badge>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Ready
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                onClick={startEditingQuestion}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Edit Question
                              </Button>
                            </div>
                            <ReadOnlyEvaluationQuestionView question={currentQuestion} />
                          </>
                        )}
                      </>
                    )
                  )}
                </div>
              </Card>
            </div>

            {/* Right Sidebar - Preview */}
            <div className="col-span-3">
              {editorMode === 'question' && currentQuestion && (
                <EvaluationQuestionPreview question={currentQuestion} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CreateEvaluationForm(props: CreateEvaluationFormProps) {
  return (
    <EvaluationEditorProvider>
      <CreateEvaluationFormInner {...props} />
    </EvaluationEditorProvider>
  )
}

