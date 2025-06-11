"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { SurveyQuestion } from "@/lib/hooks/useSessionAssesment"
import { toast } from "sonner"

interface AddQuestionFormProps {
  surveyId: string
  onCancel: () => void
  onSubmit: (data: { surveyId: string; questionData: SurveyQuestion }) => void
  isSubmitting: boolean
}

export function AddQuestionForm({
  surveyId,
  onCancel,
  onSubmit,
  isSubmitting
}: AddQuestionFormProps) {
  const [question, setQuestion] = useState<SurveyQuestion>({
    question: "",
    choices: ["", ""]
  })

  const updateQuestionText = (text: string) => {
    setQuestion(prev => ({ ...prev, question: text }))
  }

  const addChoice = () => {
    if (question.choices.length >= 6) return
    setQuestion(prev => ({
      ...prev,
      choices: [...prev.choices, ""]
    }))
  }

  const removeChoice = (index: number) => {
    if (question.choices.length <= 2) return
    setQuestion(prev => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index)
    }))
  }

  const updateChoice = (index: number, value: string) => {
    setQuestion(prev => ({
      ...prev,
      choices: prev.choices.map((c, i) => i === index ? value : c)
    }))
  }

  const validateQuestion = () => {
    if (!question.question.trim()) {
      toast.error("Please enter a question")
      return false
    }
    
    if (question.choices.length < 2) {
      toast.error("Please add at least 2 choices")
      return false
    }
    
    if (question.choices.some(c => !c.trim())) {
      toast.error("Please fill in all choices")
      return false
    }
    
    return true
  }

  const handleSubmit = () => {
    if (!validateQuestion()) return
    
    onSubmit({
      surveyId,
      questionData: question
    })
  }

  // Component for preview choice
  const PreviewChoice = ({ choice, index }: { choice: string; index: number }) => (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
        {String.fromCharCode(65 + index)}
      </div>
      <span>{choice || `Choice ${index + 1} will appear here`}</span>
    </div>
  )

  return (
    <div className="px-[7%] py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Add New Question</h2>
          <p className="text-gray-600 mt-1">
            Add a new multiple-choice question to this survey
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Question Details</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <Input
                  value={question.question}
                  onChange={(e) => updateQuestionText(e.target.value)}
                  placeholder="Enter your question"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Answer Choices</label>
                <div className="space-y-3">
                  {question.choices.map((choice, index) => (
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
                        disabled={question.choices.length <= 2}
                        className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {question.choices.length < 6 && (
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
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Question"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Preview Section */}
        <div>
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Preview</h3>
            </div>
            <div className="space-y-6">
              {/* Question Preview */}
              <Card className="bg-gray-50 border p-6">
                <h3 className="text-lg font-medium mb-4">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full mr-2 text-sm">
                    1
                  </span>
                  {question.question || "Your question will appear here"}
                </h3>
                <div className="space-y-3 pl-9">
                  {question.choices.map((choice, choiceIdx) => (
                    <PreviewChoice 
                      key={choiceIdx} 
                      choice={choice} 
                      index={choiceIdx} 
                    />
                  ))}
                </div>
              </Card>

              {question.choices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Add choices to see them previewed here
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 