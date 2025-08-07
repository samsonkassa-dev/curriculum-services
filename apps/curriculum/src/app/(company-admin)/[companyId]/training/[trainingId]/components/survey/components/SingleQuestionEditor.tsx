"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import { CreateSurveyEntry, QuestionType, getDefaultQuestionFields } from "@/lib/hooks/useSurvey"

interface SingleQuestionEditorProps {
  question: CreateSurveyEntry
  onUpdateQuestion: (updates: Partial<CreateSurveyEntry>) => void
}

export function SingleQuestionEditor({ question, onUpdateQuestion }: SingleQuestionEditorProps) {
  const handleQuestionTypeChange = (newType: QuestionType) => {
    const defaults = getDefaultQuestionFields(newType)
    onUpdateQuestion({
      questionType: newType,
      ...defaults
    })
  }

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...question.choices]
    newChoices[index] = value
    onUpdateQuestion({ choices: newChoices })
  }

  const addChoice = () => {
    onUpdateQuestion({ choices: [...question.choices, ""] })
  }

  const removeChoice = (index: number) => {
    if (question.choices.length > 2) {
      onUpdateQuestion({ choices: question.choices.filter((_, i) => i !== index) })
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
            {question.choices.map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={choice}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                {question.choices.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChoice(index)}
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
              onClick={addChoice}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
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
    </div>
  )
}
