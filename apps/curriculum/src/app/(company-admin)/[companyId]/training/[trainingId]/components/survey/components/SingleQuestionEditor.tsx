"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Send, X } from "lucide-react"
import { CreateSurveyEntry, QuestionType, getDefaultQuestionFields, useAddChoice, useRemoveChoice } from "@/lib/hooks/useSurvey"
import { FileUpload } from "@/components/ui/file-upload"
import { ChoiceDeleteDialog } from "./ChoiceDeleteDialog"

interface SingleQuestionEditorProps {
  question: CreateSurveyEntry
  onUpdateQuestion: (updates: Partial<CreateSurveyEntry>) => void
  isFirstInSection?: boolean
  isEditMode?: boolean
  surveyEntryId?: string // Required when in edit mode for immediate choice add/remove operations
  onRefreshSurveyData?: () => void // For refreshing data after API operations
}

export function SingleQuestionEditor({ 
  question, 
  onUpdateQuestion, 
  isFirstInSection = false, 
  isEditMode = false, 
  surveyEntryId,
  onRefreshSurveyData
}: SingleQuestionEditorProps) {
  // API hooks for immediate choice add/remove operations only
  const { addChoice, isLoading: isAddingChoice } = useAddChoice()
  const { removeChoice, isLoading: isRemovingChoice } = useRemoveChoice()
  
  // Add choice input state
  const [showAddChoiceInput, setShowAddChoiceInput] = useState(false)
  const [newChoiceText, setNewChoiceText] = useState("")
  const [newChoiceImageFile, setNewChoiceImageFile] = useState<File | undefined>(undefined)
  
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    choiceIndex: number;
    choiceText: string;
    choiceOrder: string;
  }>({
    isOpen: false,
    choiceIndex: -1,
    choiceText: "",
    choiceOrder: ""
  });


  const handleQuestionTypeChange = (newType: QuestionType) => {
    const defaults = getDefaultQuestionFields(newType)
    const normalizedChoices = Array.isArray(defaults.choices)
      ? defaults.choices.map((c, i) => {
          // Clear images when switching question type
          return { 
            choice: c.choice || "", 
            choiceImageFile: undefined,
            choiceImage: undefined 
          }
        })
      : []
    
    // Always use local state - API call will happen when save is clicked
    onUpdateQuestion({
      questionType: newType,
      choices: normalizedChoices,
      rows: defaults.rows || [],
      allowTextAnswer: defaults.allowTextAnswer ?? false,
      // Also clear question image when switching type
      questionImageFile: undefined,
      questionImage: undefined,
      // Clear follow-up settings when switching to GRID
      ...(newType === 'GRID' && {
        followUp: false,
        parentQuestionNumber: undefined,
        parentChoice: undefined
      })
    })
  }

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = question.choices.map((c, i) => i === index ? { ...c, choice: value } : c)
    onUpdateQuestion({ choices: newChoices })
  }

  const handleShowAddChoiceInput = () => {
    setShowAddChoiceInput(true)
    setNewChoiceText("")
    setNewChoiceImageFile(undefined)
  }

  const handleCancelAddChoice = () => {
    setShowAddChoiceInput(false)
    setNewChoiceText("")
    setNewChoiceImageFile(undefined)
  }

  const handleAddChoiceDirectly = () => {
    // Old behavior for create mode - directly add empty choice
    const newChoices = [...question.choices, { choice: "" }]
    onUpdateQuestion({ choices: newChoices })
  }

  const handleSubmitNewChoice = () => {
    // Require either text or image
    if (!newChoiceText.trim() && !newChoiceImageFile) return
    
    if (isEditMode && surveyEntryId) {
      // Use API call for existing questions only
      addChoice({
        surveyEntryId,
        choiceData: {
          choice: newChoiceText.trim(),
          choiceImage: undefined,
          choiceImageFile: newChoiceImageFile
        }
      }, {
        onSuccess: () => {
          setShowAddChoiceInput(false)
          setNewChoiceText("")
          setNewChoiceImageFile(undefined)
          // Refresh survey data to update UI
          onRefreshSurveyData?.()
        },
        onError: () => {
          // Keep input open on error so user can retry
        }
      })
    } else {
      // Use local state for new questions during creation
      onUpdateQuestion({ 
        choices: [...question.choices, { 
          choice: newChoiceText.trim() || "", // Ensure we have a string even if empty for image-only choices
          choiceImage: undefined,
          choiceImageFile: newChoiceImageFile
        }] 
      })
      setShowAddChoiceInput(false)
      setNewChoiceText("")
      setNewChoiceImageFile(undefined)
    }
  }

  const handleRemoveChoiceClick = (index: number) => {
    if (question.choices.length <= 2) return
    
    const choice = question.choices[index]
    const choiceText = choice?.choice || ""
    // Calculate order based on index (A, B, C, etc.)
    const choiceOrder = String.fromCharCode(65 + index)
    
    if (isEditMode && surveyEntryId) {
      // Show delete dialog for existing questions - only API, no local fallback
      setDeleteDialog({
        isOpen: true,
        choiceIndex: index,
        choiceText,
        choiceOrder
      })
    } else {
      // Direct removal for new questions during creation (local state)
      onUpdateQuestion({ choices: question.choices.filter((_, i) => i !== index) })
    }
  }

  const handleConfirmRemoveChoice = () => {
    if (isEditMode && surveyEntryId) {
      // Use API call for existing questions - dialog stays open until success
      removeChoice({
        surveyEntryId,
        order: deleteDialog.choiceOrder
      }, {
        onSuccess: () => {
          // Only close dialog and reset state on success
          setDeleteDialog({ isOpen: false, choiceIndex: -1, choiceText: "", choiceOrder: "" })
          // Refresh survey data to update UI
          onRefreshSurveyData?.()
        },
        onError: () => {
          // Keep dialog open on error so user can retry
        }
      })
    }
  }

  const handleRowChange = (index: number, value: string) => {
    const newRows = [...question.rows]
    newRows[index] = value
    onUpdateQuestion({ rows: newRows })
  }

  const addRow = () => {
    onUpdateQuestion({ rows: [...question.rows, ""] })
  }

  const removeRow = (index: number) => {
    if (question.rows.length > 2) {
      onUpdateQuestion({ rows: question.rows.filter((_, i) => i !== index) })
    }
  }

  return (
    <div className="space-y-6">
      {/* Image for question */}
      <div>
        <Label className="text-sm font-medium">Question Image</Label>
        <div className="mt-2 flex items-center gap-3">
          <FileUpload accept="image/*" onChange={(file) => onUpdateQuestion({ questionImageFile: file || undefined })} />
          {(question.questionImageFile || question.questionImage) && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={question.questionImageFile ? URL.createObjectURL(question.questionImageFile) : question.questionImage} 
                alt="question" 
                className="h-16 w-16 object-cover rounded border" 
              />
              <div className="text-xs text-gray-600">
                {question.questionImageFile ? (
                  <>
                    <div className="font-medium truncate max-w-[160px]">{question.questionImageFile.name}</div>
                    <div>{(question.questionImageFile.size / 1024).toFixed(1)} KB</div>
                  </>
                ) : (
                  <div className="font-medium">Existing image</div>
                )}
              </div>
              <button
                type="button"
                className="text-red-600 text-xs"
                onClick={() => onUpdateQuestion({ 
                  questionImageFile: undefined, 
                  questionImage: question.questionImageFile ? question.questionImage : undefined 
                })}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="questionText" className="text-sm font-medium">Question Text</Label>
        <Textarea
          id="questionText"
          value={question.question}
          onChange={(e) => onUpdateQuestion({ question: e.target.value })}
          placeholder="Enter your question here..."
          className="mt-2"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Question Type</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {(['TEXT', 'RADIO', 'CHECKBOX', 'GRID'] as QuestionType[]).map((type) => (
            <Button
              key={type}
              variant={question.questionType === type ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuestionTypeChange(type)}
              className={`h-auto p-3 font-semibold transition-all duration-200 ${
                question.questionType === type 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                  : "border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`/question-type-${type.toLowerCase()}.svg`}
                  alt={`${type} icon`}
                  className="w-4 h-4"
                />
                {type}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {(question.questionType === 'RADIO' || question.questionType === 'CHECKBOX' || question.questionType === 'GRID') && (
        <div>
          <Label className="text-sm font-medium">
            {question.questionType === 'GRID' ? 'Column Options' : 'Answer Options'}
          </Label>
          <div className="space-y-2 mt-2">
            {(question.choices || []).map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={choice.choice ?? ""}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <FileUpload
                    accept="image/*"
                    onChange={(file) => {
                      const newChoices = question.choices.map((c, i) => i === index ? { ...c, choiceImageFile: file || undefined } : c);
                      onUpdateQuestion({ choices: newChoices });
                    }}
                  />
                  {(choice.choiceImageFile || choice.choiceImage) && (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={choice.choiceImageFile ? URL.createObjectURL(choice.choiceImageFile) : choice.choiceImage} 
                        alt="choice" 
                        className="h-10 w-10 object-cover rounded border" 
                      />
                      <button
                        type="button"
                        className="text-red-600 text-xs"
                        onClick={() => onUpdateQuestion({ 
                          choices: question.choices.map((c, i) => i === index ? { 
                            ...c, 
                            choiceImageFile: undefined, 
                            choiceImage: c.choiceImageFile ? c.choiceImage : undefined 
                          } : c) 
                        })}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                {question.choices.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveChoiceClick(index)}
                    disabled={isRemovingChoice}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove this choice"
                  >
                    {isRemovingChoice ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-red-500"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
            
            {/* Add choice input area - only for existing questions in edit mode */}
            {isEditMode && surveyEntryId && showAddChoiceInput ? (
              <div className="space-y-2 p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2">
                  <Input
                    value={newChoiceText}
                    onChange={(e) => setNewChoiceText(e.target.value)}
                    placeholder="Enter choice text (optional if adding image)"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (newChoiceText.trim() || newChoiceImageFile) && handleSubmitNewChoice()}
                  />
                  <FileUpload
                    accept="image/*"
                    onChange={(file) => setNewChoiceImageFile(file || undefined)}
                  />
                </div>
                
                {/* Show image preview if selected */}
                {newChoiceImageFile && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={URL.createObjectURL(newChoiceImageFile)} 
                      alt="choice preview" 
                      className="h-12 w-12 object-cover rounded border" 
                    />
                    <div className="flex-1 text-xs text-gray-600">
                      <div className="font-medium truncate">{newChoiceImageFile.name}</div>
                      <div>{(newChoiceImageFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewChoiceImageFile(undefined)}
                      disabled={isAddingChoice}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {newChoiceText.trim() && newChoiceImageFile 
                      ? "Text + Image choice" 
                      : newChoiceImageFile 
                        ? "Image-only choice" 
                        : newChoiceText.trim() 
                          ? "Text-only choice" 
                          : "Add text or image"}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSubmitNewChoice}
                      disabled={(!newChoiceText.trim() && !newChoiceImageFile) || isAddingChoice}
                      className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isAddingChoice ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                          <span>Adding...</span>
                        </div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelAddChoice}
                      disabled={isAddingChoice}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={isEditMode && surveyEntryId ? handleShowAddChoiceInput : handleAddChoiceDirectly}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>
        </div>
      )}

      {question.questionType === 'GRID' && (
        <div>
          <Label className="text-sm font-medium">Row Options</Label>
          <div className="space-y-2 mt-2">
            {question.rows.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={row}
                  onChange={(e) => handleRowChange(index, e.target.value)}
                  placeholder={`Row ${index + 1}`}
                  className="flex-1"
                />
                {question.rows.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={addRow}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion({ required: !!checked })}
        />
        <Label htmlFor="required" className="text-sm font-medium">
          Required question
        </Label>
      </div>

      {/* Follow-up configuration (hidden for first question in a section and GRID questions) */}
      {!isFirstInSection && question.questionType !== 'GRID' && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="followUp"
              checked={!!question.followUp}
              onCheckedChange={(checked) => onUpdateQuestion({ followUp: !!checked })}
            />
            <Label htmlFor="followUp" className="text-sm font-medium">
              This is a follow-up question
            </Label>
          </div>
          {question.followUp && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm font-medium">Parent Question Number</Label>
                <Input
                  value={typeof question.parentQuestionNumber === 'number' ? String(question.parentQuestionNumber) : ""}
                  onChange={(e) => onUpdateQuestion({ parentQuestionNumber: Number(e.target.value) || 0 })}
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Parent Choice (letter)</Label>
                <Input
                  value={(question.parentChoice || "").toString().toUpperCase()}
                  onChange={(e) => {
                    const v = (e.target.value || "").toUpperCase();
                    // keep only first A-Z
                    const letter = v.replace(/[^A-Z]/g, "").slice(0, 1);
                    onUpdateQuestion({ parentChoice: letter });
                  }}
                  placeholder="A, B, C, ..."
                />
                <p className="text-[10px] text-gray-500 mt-1">Match by option order: A = first choice, B = second, etc.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Choice Delete Confirmation Dialog */}
      <ChoiceDeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, choiceIndex: -1, choiceText: "", choiceOrder: "" })}
        onConfirm={handleConfirmRemoveChoice}
        choiceText={deleteDialog.choiceText}
        choiceOrder={deleteDialog.choiceOrder}
        isDeleting={isRemovingChoice}
      />
    </div>
  )
}
