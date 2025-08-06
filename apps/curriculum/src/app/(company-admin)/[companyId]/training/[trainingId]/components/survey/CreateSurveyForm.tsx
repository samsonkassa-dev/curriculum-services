"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { 
  CreateSurveyData, 
  CreateSurveySection, 
  CreateSurveyEntry, 
  QuestionType,
  SurveyType,
  getDefaultQuestionFields,
  validateCreateSurveyEntry,
  useSurveySections,
  useAddSectionToSurvey,
  AddSectionData
} from "@/lib/hooks/useSurvey"
import { toast } from "sonner"

// Preview Components for Different Question Types (moved outside main component)
const PreviewText = ({ question }: { question: CreateSurveyEntry }) => (
  <div className="space-y-3">
    <div>
      <p className="font-medium break-words whitespace-normal leading-relaxed">{question.question || "Text question will appear here"}</p>
    </div>
    <div className="ml-4">
      <Textarea
        placeholder="Trainee will type their answer here..."
        disabled
        className="bg-gray-50 border-gray-200"
        rows={3}
      />
    </div>
  </div>
)

const PreviewRadio = ({ question }: { question: CreateSurveyEntry }) => (
  <div className="space-y-3">
    <div>
      <p className="font-medium break-words whitespace-normal leading-relaxed">{question.question || "Radio question will appear here"}</p>
    </div>
    <div className="ml-4 space-y-2">
      {question.choices.map((choice, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0"></div>
          <span className="break-words whitespace-normal">{choice || `Option ${index + 1}`}</span>
        </div>
      ))}
    </div>
  </div>
)

const PreviewCheckbox = ({ question }: { question: CreateSurveyEntry }) => (
  <div className="space-y-3">
    <div>
      <p className="font-medium break-words whitespace-normal leading-relaxed">{question.question || "Checkbox question will appear here"}</p>
    </div>
    <div className="ml-4 space-y-2">
      {question.choices.map((choice, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="w-4 h-4 border-2 border-gray-300 rounded mt-0.5 flex-shrink-0"></div>
          <span className="break-words whitespace-normal">{choice || `Option ${index + 1}`}</span>
        </div>
      ))}
    </div>
  </div>
)

const PreviewGrid = ({ question }: { question: CreateSurveyEntry }) => (
  <div className="space-y-3">
    <div>
      <p className="font-medium break-words whitespace-normal leading-relaxed">{question.question || "Grid question will appear here"}</p>
    </div>
    <div className="ml-4 overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 p-2 text-left text-xs"></th>
            {question.choices.map((choice, index) => (
              <th key={index} className="border border-gray-200 p-2 text-center text-xs break-words">
                {choice || `Column ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="border border-gray-200 p-2 text-sm break-words">
                {row || `Row ${rowIndex + 1}`}
              </td>
              {question.choices.map((_, colIndex) => (
                <td key={colIndex} className="border border-gray-200 p-2 text-center">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 mx-auto"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const QuestionPreview = ({ question }: { question: CreateSurveyEntry }) => {
  switch (question.questionType) {
    case 'TEXT':
      return <PreviewText question={question} />
    case 'RADIO':
      return <PreviewRadio question={question} />
    case 'CHECKBOX':
      return <PreviewCheckbox question={question} />
    case 'GRID':
      return <PreviewGrid question={question} />
    default:
      return <div>Unsupported question type</div>
  }
}

// Question Type Selector Component
const QuestionTypeSelector = ({ 
  questionType, 
  onChange 
}: { 
  questionType: QuestionType; 
  onChange: (type: QuestionType) => void 
}) => {
  const getIconSrc = (type: QuestionType) => {
    switch (type) {
      case 'TEXT': return '/question-type-text.svg'
      case 'RADIO': return '/question-type-radio.svg'
      case 'CHECKBOX': return '/question-type-checkbox.svg'
      case 'GRID': return '/question-type-grid.svg'
      default: return '/question-type-text.svg'
    }
  }

  return (
    <div className="space-y-2">
      <Label>Question Type</Label>
      <div className="grid grid-cols-2 gap-3">
        {([
          { type: 'TEXT' as const, label: 'Text Answer', desc: 'Free text input' },
          { type: 'RADIO' as const, label: 'Single Choice', desc: 'Select one option' },
          { type: 'CHECKBOX' as const, label: 'Multiple Choice', desc: 'Select multiple' },
          { type: 'GRID' as const, label: 'Grid/Matrix', desc: 'Rate multiple items' }
        ]).map(({ type, label, desc }) => (
          <Button
            key={type}
            variant={questionType === type ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(type)}
            className={`h-auto p-4 flex flex-col items-start transition-all duration-200 ${
              questionType === type 
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg border-0" 
                : "border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
            }`}
            type="button"
          >
            <div className="flex items-center gap-2 mb-1">
              <img 
                src={getIconSrc(type)} 
                alt={`${type} icon`}
                className={`w-5 h-5 ${
                  questionType === type ? "text-white" : "text-gray-600"
                }`}
              />
              <span className={`font-semibold text-sm ${
                questionType === type ? "text-white" : ""
              }`}>{label}</span>
            </div>
            <span className={`text-xs leading-tight ${
              questionType === type ? "text-blue-100" : "text-gray-500"
            }`}>{desc}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

// Choice Management Component (for RADIO, CHECKBOX, GRID)
const ChoicesManager = ({
  choices,
  onUpdate,
  label = "Answer Choices"
}: {
  choices: string[];
  onUpdate: (choices: string[]) => void;
  label?: string;
}) => {
  const addChoice = () => {
    if (choices.length < 6) {
      onUpdate([...choices, ""])
    }
  }

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      onUpdate(choices.filter((_, i) => i !== index))
    }
  }

  const updateChoice = (index: number, value: string) => {
    onUpdate(choices.map((choice, i) => i === index ? value : choice))
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {choices.map((choice, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
            {String.fromCharCode(65 + index)}
          </div>
          <Input
            value={choice}
            onChange={(e) => updateChoice(index, e.target.value)}
            placeholder={`Choice ${index + 1}`}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeChoice(index)}
            disabled={choices.length <= 2}
            className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {choices.length < 6 && (
        <Button
          variant="outline"
          size="sm"
          onClick={addChoice}
          className="flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Choice
        </Button>
      )}
    </div>
  )
}

// Rows Manager for GRID surveyEntries
const RowsManager = ({
  rows,
  onUpdate
}: {
  rows: string[];
  onUpdate: (rows: string[]) => void;
}) => {
  const addRow = () => {
    if (rows.length < 8) {
      onUpdate([...rows, ""])
    }
  }

  const removeRow = (index: number) => {
    if (rows.length > 2) {
      onUpdate(rows.filter((_, i) => i !== index))
    }
  }

  const updateRow = (index: number, value: string) => {
    onUpdate(rows.map((row, i) => i === index ? value : row))
  }

  return (
    <div className="space-y-3">
      <Label>Row Options (Items to Rate)</Label>
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
            {index + 1}
          </div>
          <Input
            value={row}
            onChange={(e) => updateRow(index, e.target.value)}
            placeholder={`Row option ${index + 1}`}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeRow(index)}
            disabled={rows.length <= 2}
            className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {rows.length < 8 && (
        <Button
          variant="outline"
          size="sm"
          onClick={addRow}
          className="flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Row
        </Button>
      )}
    </div>
  )
}





interface CreateSurveyFormProps {
  onCancel: () => void
  onSubmit: (data: CreateSurveyData) => void
  isSubmitting: boolean
  editingSurveyId?: string // Optional - if provided, we're in edit mode
  initialSurveyName?: string
  initialSurveyType?: SurveyType
  initialSurveyDescription?: string
  focusSection?: {
    sectionId?: string // If provided, focus on this section for adding questions
    action: 'add-question' | 'add-section' // Whether to add question or new section
  }
}



// Single Question Editor Component
const SingleQuestionEditor = ({
  question,
  sectionIndex,
  questionIndex,
  onUpdate,
  onUpdateType
}: {
  question: CreateSurveyEntry
  sectionIndex: number
  questionIndex: number
  onUpdate: (updates: Partial<CreateSurveyEntry>) => void
  onUpdateType: (type: QuestionType) => void
}) => (
  <div className="space-y-6">
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-600">
        Section {sectionIndex + 1} - Question {questionIndex + 1}
      </h4>
    </div>
    
    <div className="space-y-6">
      <QuestionTypeSelector
        questionType={question.questionType}
        onChange={onUpdateType}
      />

      <div>
        <Label className="text-sm font-medium">Question Text</Label>
        <Textarea
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          placeholder="Enter your question"
          className="mt-2"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required-question"
          checked={question.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="rounded"
          aria-label="Mark question as required"
          title="Mark question as required"
        />
        <Label htmlFor="required-question" className="text-sm">Required question</Label>
      </div>

      {(question.questionType === 'RADIO' || question.questionType === 'CHECKBOX') && (
        <ChoicesManager
          choices={question.choices}
          onUpdate={(choices) => onUpdate({ choices })}
        />
      )}

      {question.questionType === 'GRID' && (
        <div className="space-y-4">
          <ChoicesManager
            choices={question.choices}
            onUpdate={(choices) => onUpdate({ choices })}
            label="Column Headers (Rating Scale)"
          />
          <RowsManager
            rows={question.rows}
            onUpdate={(rows) => onUpdate({ rows })}
          />
        </div>
      )}
    </div>
  </div>
)



export function CreateSurveyForm({ 
  onCancel, 
  onSubmit, 
  isSubmitting,
  editingSurveyId,
  initialSurveyName = "",
  initialSurveyType = "BASELINE",
  initialSurveyDescription = "",
  focusSection
}: CreateSurveyFormProps) {
  const isEditMode = !!editingSurveyId
  
  const [surveyName, setSurveyName] = useState(initialSurveyName)
  const [surveyType, setSurveyType] = useState<SurveyType>(initialSurveyType)
  const [surveyDescription, setSurveyDescription] = useState(initialSurveyDescription)
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
  const [sectionsLoaded, setSectionsLoaded] = useState(false)
  
  // Navigation state
  const [selectedSection, setSelectedSection] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  
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

      // Handle focus section logic
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
      }

      setSections(convertedSections)
      setSectionsLoaded(true)
    }
  }, [existingSectionsData, isEditMode, sectionsLoaded, focusSection])
  
  // Hook for adding sections to existing surveys
  const { addSection: addSectionToSurvey, isLoading: isAddingSection } = useAddSectionToSurvey()
  const [editMode, setEditMode] = useState<'survey' | 'question'>('survey')

  // Section management
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

  const updateSectionTitle = (sectionIndex: number, title: string) => {
    setSections(prev => prev.map((section, i) => 
      i === sectionIndex ? { ...section, title } : section
    ))
  }

  // Question management within sections
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

  const updateQuestionType = (sectionIndex: number, questionIndex: number, questionType: QuestionType) => {
    const defaults = getDefaultQuestionFields(questionType)
    updateQuestion(sectionIndex, questionIndex, { questionType, ...defaults })
  }

  // Navigation helpers
  const selectQuestion = (sectionIndex: number, questionIndex: number) => {
    setSelectedSection(sectionIndex)
    setSelectedQuestion(questionIndex)
    setEditMode('question')
  }

  const selectSurveySettings = () => {
    setEditMode('survey')
  }

  const addQuestionToSection = (sectionIndex: number) => {
    addQuestion(sectionIndex)
    // Auto-select the new question
    const newQuestionIndex = sections[sectionIndex].surveyEntries.length
    selectQuestion(sectionIndex, newQuestionIndex)
  }

  const validateForm = () => {
    // Validate survey details
    if (!surveyName.trim()) {
      toast.error("Please enter a survey name")
      return false
    }
    if (!surveyDescription.trim()) {
      toast.error("Please enter a survey description")
      return false
    }

    // Validate sections
    if (sections.length === 0) {
      toast.error("Please add at least one section")
      return false
    }

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex]
      
      if (!section.title.trim()) {
        toast.error(`Please enter a title for section ${sectionIndex + 1}`)
        return false
      }

      if (section.surveyEntries.length === 0) {
        toast.error(`Section "${section.title}" must have at least one question`)
        return false
      }

      // Validate each question in the section
      for (let questionIndex = 0; questionIndex < section.surveyEntries.length; questionIndex++) {
        const entry = section.surveyEntries[questionIndex]
        const validation = validateCreateSurveyEntry(entry)
        
        if (!validation.isValid) {
          toast.error(`Section "${section.title}", Question ${questionIndex + 1}: ${validation.errors[0]}`)
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    onSubmit({
      name: surveyName,
      type: surveyType,
      description: surveyDescription,
      sections: sections
    })
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-[7%] py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Survey</h2>
            <p className="text-gray-600 mt-1">
              {editMode === 'survey' 
                ? 'Configure survey settings and basic information'
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
                ? (isAddingSection ? "Adding Sections..." : "Add Sections to Survey")
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
            <div className="bg-white rounded-lg border shadow-sm sticky top-8">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">Survey Structure</h3>
              </div>
              
              <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Survey Settings */}
                <div
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    editMode === 'survey' 
                      ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={selectSurveySettings}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">⚙️</span>
                    <span className="font-medium text-sm">Survey Settings</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {surveyName || 'Untitled Survey'}
                  </p>
                </div>

                {/* Sections */}
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="bg-white rounded-lg border border-gray-200">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-green-600 text-lg">📁</span>
                          <div className="flex-1">
                            <Input
                              value={section.title}
                              onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                              placeholder={`Section ${sectionIndex + 1}`}
                              className="text-sm h-9 border-0 px-3 py-2 font-medium bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-300 focus:rounded transition-all duration-200"
                            />
                          </div>
                        </div>
                        {sections.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(sectionIndex)}
                            className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      {section.surveyEntries.map((entry, questionIndex) => (
                        <div
                          key={questionIndex}
                          className={`p-2 rounded cursor-pointer transition-all ${
                            editMode === 'question' && selectedSection === sectionIndex && selectedQuestion === questionIndex
                              ? 'bg-blue-50 border border-blue-200 shadow-sm'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => selectQuestion(sectionIndex, questionIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={`/question-type-${entry.questionType.toLowerCase()}.svg`}
                                alt={`${entry.questionType} icon`}
                                className="w-4 h-4 text-gray-600"
                              />
                              <span className="text-sm font-medium">Q{questionIndex + 1}</span>
                            </div>
                            {section.surveyEntries.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeQuestion(sectionIndex, questionIndex)
                                }}
                                className="p-1 h-5 w-5 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {entry.question || 'Untitled question'}
                          </p>
                        </div>
                      ))}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addQuestionToSection(sectionIndex)}
                        className="w-full text-left justify-start p-2 h-auto text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addSection}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </div>
          </div>

          {/* Center - Edit Form */}
          <div className="col-span-5">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editMode === 'survey' ? 'Survey Settings' : `Question Editor`}
                </h3>
              </div>
              
              <div className="p-6">
                {editMode === 'survey' ? (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="surveyName" className="text-sm font-medium">Survey Name</Label>
                      <Input
                        id="surveyName"
                        value={surveyName}
                        onChange={(e) => setSurveyName(e.target.value)}
                        placeholder="Enter survey name"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Survey Type</Label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
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
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="surveyDescription" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="surveyDescription"
                        value={surveyDescription}
                        onChange={(e) => setSurveyDescription(e.target.value)}
                        placeholder="Enter survey description"
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                  </div>
                ) : (
                  sections[selectedSection]?.surveyEntries[selectedQuestion] && (
                    <SingleQuestionEditor
                      question={sections[selectedSection].surveyEntries[selectedQuestion]}
                      sectionIndex={selectedSection}
                      questionIndex={selectedQuestion}
                      onUpdate={(updates) => updateQuestion(selectedSection, selectedQuestion, updates)}
                      onUpdateType={(type) => updateQuestionType(selectedSection, selectedQuestion, type)}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right - Preview */}
          <div className="col-span-4">
            <div className="bg-white rounded-lg border shadow-sm sticky top-8">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {editMode === 'survey' ? 'Complete survey' : `Section ${selectedSection + 1}`}
                </p>
              </div>
              
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Survey Header */}
                <div className="bg-blue-50 p-4 rounded-lg border mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-lg">
                      {surveyName || "Survey Name"}
                    </h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {surveyType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 break-words whitespace-normal leading-relaxed">
                    {surveyDescription || "Survey description will appear here"}
                  </p>
                </div>

                {/* Preview Content */}
                {editMode === 'survey' ? (
                  // Full Survey Preview
                  <div className="space-y-6">
                    {sections.map((section, sectionIndex) => (
                      <div key={sectionIndex}>
                        <div className="bg-gray-100 p-3 rounded-lg mb-4">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            Section {sectionIndex + 1}: {section.title || "Section Title"}
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {section.surveyEntries.map((entry, questionIndex) => (
                            <Card key={questionIndex} className="p-3 bg-white border">
                              <div className="mb-2">
                                <img 
                                  src={`/question-type-${entry.questionType.toLowerCase()}.svg`}
                                  alt={`${entry.questionType} icon`}
                                  className="w-4 h-4 text-gray-600"
                                />
                              </div>
                              <QuestionPreview question={entry} />
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Single Section Preview
                  sections[selectedSection] && (
                    <div>
                      <div className="bg-gray-100 p-3 rounded-lg mb-4">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          Section {selectedSection + 1}: {sections[selectedSection].title || "Section Title"}
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {sections[selectedSection].surveyEntries.map((entry, questionIndex) => (
                          <Card 
                            key={questionIndex} 
                            className={`p-3 border transition-colors ${
                              questionIndex === selectedQuestion 
                                ? 'bg-blue-50 border-blue-300' 
                                : 'bg-white'
                            }`}
                          >
                            <div className="mb-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs">
                                  {questionIndex + 1}
                                </span>
                                {entry.required && (
                                  <span className="text-red-500 text-sm font-medium">*</span>
                                )}
                                <img 
                                  src={`/question-type-${entry.questionType.toLowerCase()}.svg`}
                                  alt={`${entry.questionType} icon`}
                                  className="w-4 h-4 text-gray-600"
                                />
                              </div>
                            </div>
                            <QuestionPreview question={entry} />
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {sections.length === 0 && (
                  <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm">Add sections and surveyEntries to see the preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
