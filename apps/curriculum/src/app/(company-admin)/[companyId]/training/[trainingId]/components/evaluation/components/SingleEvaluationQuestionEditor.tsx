"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2 } from "lucide-react"
import { EvaluationEntryForm, EvaluationChoiceForm, EvaluationQuestionType } from "@/lib/hooks/evaluation-types"

interface SingleEvaluationQuestionEditorProps {
  question: EvaluationEntryForm
  onUpdateQuestion: (updates: Partial<EvaluationEntryForm>) => void
  availableParentQuestions?: Array<{
    clientId: string
    question: string
    choices: (EvaluationChoiceForm & { id?: string })[]
    id?: string // Server ID if question exists in DB
  }>
}

export function SingleEvaluationQuestionEditor({
  question,
  onUpdateQuestion,
  availableParentQuestions = []
}: SingleEvaluationQuestionEditorProps) {
  
  const addChoice = () => {
    const newChoice: EvaluationChoiceForm = {
      clientId: crypto.randomUUID(),
      choiceText: "",
      choiceImage: ""
    }
    onUpdateQuestion({
      choices: [...question.choices, newChoice]
    })
  }

  const removeChoice = (choiceIndex: number) => {
    onUpdateQuestion({
      choices: question.choices.filter((_, i) => i !== choiceIndex)
    })
  }

  const updateChoice = (choiceIndex: number, updates: Partial<EvaluationChoiceForm>) => {
    onUpdateQuestion({
      choices: question.choices.map((choice, i) => 
        i === choiceIndex ? { ...choice, ...updates } : choice
      )
    })
  }

  const handleFollowUpToggle = (value: string) => {
    const isFollowUp = value === 'yes'
    onUpdateQuestion({
      isFollowUp,
      // Clear follow-up related fields when disabled
      ...(isFollowUp ? {} : {
        parentQuestionClientId: undefined,
        triggerChoiceClientIds: undefined,
        parentQuestionId: undefined,
        triggerChoiceIds: undefined
      })
    })
  }

  const handleParentQuestionChange = (parentClientId: string) => {
    const parentQuestion = availableParentQuestions.find(q => q.clientId === parentClientId)
    
    // Determine if we should use client IDs or server IDs based on whether parent exists in DB
    const useClientIds = !parentQuestion?.id // If no server ID, use client IDs
    
    onUpdateQuestion({
      // Always set client IDs for frontend logic
      parentQuestionClientId: parentClientId,
      triggerChoiceClientIds: [], // Reset trigger choices when parent changes
      
      // Set server IDs if parent question already exists in DB
      ...(useClientIds ? {} : {
        parentQuestionId: parentQuestion?.id,
        triggerChoiceIds: [] // Will be set when trigger choices are selected
      })
    })
  }

  const handleTriggerChoiceToggle = (choiceClientId: string, isSelected: boolean) => {
    const currentTriggerClientIds = question.triggerChoiceClientIds || []
    const currentTriggerIds = question.triggerChoiceIds || []
    
    // Find the parent question to get choice info
    const parentQuestion = availableParentQuestions.find(q => q.clientId === question.parentQuestionClientId)
    const targetChoice = parentQuestion?.choices.find(c => c.clientId === choiceClientId)
    
    // Update client IDs (always used for frontend logic)
    const newTriggerClientIds = isSelected 
      ? [...currentTriggerClientIds, choiceClientId]
      : currentTriggerClientIds.filter(id => id !== choiceClientId)
    
    // Update server IDs if the parent question and choice have server IDs
    let newTriggerIds = currentTriggerIds
    if (targetChoice?.id) {
      newTriggerIds = isSelected 
        ? [...currentTriggerIds, targetChoice.id]
        : currentTriggerIds.filter(id => id !== targetChoice.id)
    }
    
    onUpdateQuestion({
      triggerChoiceClientIds: newTriggerClientIds,
      triggerChoiceIds: newTriggerIds
    })
  }

  const selectedParentQuestion = availableParentQuestions.find(
    q => q.clientId === question.parentQuestionClientId
  )

  const shouldShowChoices = question.questionType === "RADIO" || question.questionType === "CHECKBOX"

  return (
    <div className="space-y-6">
      {/* Question Text with Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question *
        </label>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <Input
              value={question.question}
              onChange={(e) => onUpdateQuestion({ question: e.target.value })}
              placeholder="Enter your question"
              className="w-full"
            />
          </div>
          <FileUpload 
            accept="image/*" 
            onChange={(file) => onUpdateQuestion({ questionImageFile: file || undefined })}
            variant="icon"
            size="md"
          />
        </div>
        
        {/* Question Image Preview */}
        {(question.questionImageFile || question.questionImage) && (
          <div className="mt-3 flex items-center gap-3">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuestion({ 
                questionImageFile: undefined, 
                questionImage: "" 
              })}
            >
              Remove
            </Button>
          </div>
        )}
      </div>

      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type *
        </label>
        <Select
          value={question.questionType}
          onValueChange={(value) => onUpdateQuestion({ 
            questionType: value as EvaluationQuestionType,
            // Clear choices when switching to TEXT type
            choices: value === "TEXT" ? [] : question.choices
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TEXT">Text Response</SelectItem>
            <SelectItem value="RADIO">Single Choice</SelectItem>
            <SelectItem value="CHECKBOX">Multiple Choice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Follow-up Question Settings */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Is this a follow-up question?
            </label>
            <RadioGroup
              value={question.isFollowUp ? 'yes' : 'no'}
              onValueChange={handleFollowUpToggle}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="followup-no" />
                <Label htmlFor="followup-no" className="text-sm">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="followup-yes" />
                <Label htmlFor="followup-yes" className="text-sm">Yes</Label>
              </div>
            </RadioGroup>
          </div>
          
          {question.isFollowUp && (
            <div className="space-y-4 pt-3 border-t">
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                📎 Follow-up questions only show when specific choices are selected in the parent question
              </div>
              
              {/* Only show parent selection if there are available parents */}
              {availableParentQuestions.length === 0 ? (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                  ⚠️ No parent questions available. Add some RADIO or CHECKBOX questions first.
                </div>
              ) : (
                <>
                  {/* Parent Question Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Question *
                    </label>
                    <Select
                      value={question.parentQuestionClientId || ""}
                      onValueChange={handleParentQuestionChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the question this follows up on" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableParentQuestions.map((parentQ) => (
                          <SelectItem key={parentQ.clientId} value={parentQ.clientId}>
                            {parentQ.question || `Question ${parentQ.clientId.slice(0, 8)}...`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trigger Choices Selection */}
                  {selectedParentQuestion && selectedParentQuestion.choices.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Show this question when these choices are selected:
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto bg-white p-3 rounded border">
                        {selectedParentQuestion.choices.map((choice, index) => (
                          <div key={choice.clientId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`trigger-${choice.clientId}`}
                              checked={(question.triggerChoiceClientIds || []).includes(choice.clientId)}
                              onCheckedChange={(checked) => handleTriggerChoiceToggle(choice.clientId, !!checked)}
                            />
                            <Label htmlFor={`trigger-${choice.clientId}`} className="text-sm flex-1">
                              {choice.choiceText || `Choice ${index + 1}`}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {(question.triggerChoiceClientIds || []).length === 0 && (
                        <p className="text-sm text-amber-600 mt-2">
                          ⚠️ Please select at least one trigger choice
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Choices (only for RADIO and CHECKBOX types) */}
      {shouldShowChoices && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Answer Choices *
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={addChoice}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Choice
            </Button>
          </div>

          <div className="space-y-3">
            {question.choices.map((choice, choiceIndex) => (
              <div key={choice.clientId} className="flex items-center gap-3 p-3 border rounded-lg">
                {/* Choice Text and Image */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={choice.choiceText}
                      onChange={(e) => updateChoice(choiceIndex, { choiceText: e.target.value })}
                      placeholder={`Choice ${choiceIndex + 1}`}
                      className="flex-1"
                    />
                    <FileUpload
                      accept="image/*"
                      onChange={(file) => updateChoice(choiceIndex, { choiceImageFile: file || undefined })}
                      variant="icon"
                      size="sm"
                    />
                  </div>
                  
                  {/* Choice Image Preview */}
                  {(choice.choiceImageFile || choice.choiceImage) && (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={choice.choiceImageFile ? URL.createObjectURL(choice.choiceImageFile) : choice.choiceImage} 
                        alt={`choice ${choiceIndex + 1}`} 
                        className="h-12 w-12 object-cover rounded border" 
                      />
                      <div className="text-xs text-gray-600">
                        {choice.choiceImageFile ? (
                          <>
                            <div className="font-medium truncate max-w-[120px]">{choice.choiceImageFile.name}</div>
                            <div>{(choice.choiceImageFile.size / 1024).toFixed(1)} KB</div>
                          </>
                        ) : (
                          <div className="font-medium">Existing image</div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateChoice(choiceIndex, { 
                          choiceImageFile: undefined, 
                          choiceImage: choice.choiceImageFile ? choice.choiceImage : undefined 
                        })}
                        className="text-xs px-2 py-1"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {/* Remove Choice */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChoice(choiceIndex)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={question.choices.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Validation Messages */}
          <div className="mt-2 space-y-1">
            {shouldShowChoices && question.choices.length < 1 && (
              <p className="text-sm text-red-600">
                ❌ Please add at least 1 answer choice
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
