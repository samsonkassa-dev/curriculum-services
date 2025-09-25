"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"

type QuestionType = "RADIO" | "CHECKBOX"

interface ChoiceForm {
  choice: string
  choiceImage: string
  choiceImageFile?: File
  isCorrect: boolean
}

interface AssessmentEntryForm {
  question: string
  questionImage: string
  questionImageFile?: File
  questionType: QuestionType
  choices: ChoiceForm[]
  weight: number
}

interface SingleAssessmentQuestionEditorProps {
  question: AssessmentEntryForm
  onUpdateQuestion: (updates: Partial<AssessmentEntryForm>) => void
}

export function SingleAssessmentQuestionEditor({
  question,
  onUpdateQuestion
}: SingleAssessmentQuestionEditorProps) {
  
  const addChoice = () => {
    const newChoice: ChoiceForm = {
      choice: "",
      choiceImage: "",
      isCorrect: false
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

  const updateChoice = (choiceIndex: number, updates: Partial<ChoiceForm>) => {
    onUpdateQuestion({
      choices: question.choices.map((choice, i) => 
        i === choiceIndex ? { ...choice, ...updates } : choice
      )
    })
  }

  const setCorrectChoice = (choiceIndex: number) => {
    if (question.questionType === "RADIO") {
      // For radio, only one choice can be correct
      onUpdateQuestion({
        choices: question.choices.map((choice, i) => ({
          ...choice,
          isCorrect: i === choiceIndex
        }))
      })
    } else {
      // For checkbox, toggle this choice
      updateChoice(choiceIndex, {
        isCorrect: !question.choices[choiceIndex].isCorrect
      })
    }
  }

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

      {/* Question Type and Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type *
          </label>
          <Select
            value={question.questionType}
            onValueChange={(value) => onUpdateQuestion({ 
              questionType: value as QuestionType,
              // Reset correct answers when changing type
              choices: question.choices.map(c => ({ ...c, isCorrect: false }))
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RADIO">Single Choice</SelectItem>
              <SelectItem value="CHECKBOX">Multiple Choice</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight *
          </label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={question.weight}
            onChange={(e) => onUpdateQuestion({ weight: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Choices */}
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
            <div key={choiceIndex} className="flex items-center gap-3 p-3 border rounded-lg">
              {/* Correct Answer Selector */}
              <div className="flex items-center">
                {question.questionType === "RADIO" ? (
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={choice.isCorrect}
                    onChange={() => setCorrectChoice(choiceIndex)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={choice.isCorrect}
                    onChange={() => setCorrectChoice(choiceIndex)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
                  />
                )}
                <span className="ml-2 text-xs text-gray-500">Correct</span>
              </div>

              {/* Choice Text and Image */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={choice.choice}
                    onChange={(e) => updateChoice(choiceIndex, { choice: e.target.value })}
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
                disabled={question.choices.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Validation Messages */}
        <div className="mt-2 space-y-1">
          {question.questionType === "RADIO" && question.choices.filter(c => c.isCorrect).length !== 1 && (
            <p className="text-sm text-amber-600">
              ⚠️ Please select exactly one correct answer for single choice questions
            </p>
          )}
          {question.questionType === "CHECKBOX" && question.choices.filter(c => c.isCorrect).length === 0 && (
            <p className="text-sm text-amber-600">
              ⚠️ Please select at least one correct answer for multiple choice questions
            </p>
          )}
          {question.choices.length < 2 && (
            <p className="text-sm text-red-600">
              ❌ Please add at least 2 answer choices
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
