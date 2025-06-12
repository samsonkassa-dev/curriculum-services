"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { SurveyQuestion } from "@/lib/hooks/useSessionAssesment"
import { toast } from "sonner"

interface CreateSurveyFormProps {
  onCancel: () => void
  onSubmit: (data: { name: string; description: string; surveyQuestions: SurveyQuestion[] }) => void
  isSubmitting: boolean
}

export function CreateSurveyForm({
  onCancel,
  onSubmit,
  isSubmitting
}: CreateSurveyFormProps) {
  const [surveyName, setSurveyName] = useState("")
  const [surveyDescription, setSurveyDescription] = useState("")
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { question: "", choices: ["", ""] }
  ])

  const addQuestion = () => {
    setQuestions(prev => [...prev, { question: "", choices: ["", ""] }])
  }

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuestionText = (index: number, question: string) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, question } : q
    ))
  }

  const addChoice = (questionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? { ...q, choices: [...q.choices, ""] }
        : q
    ))
  }

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? { ...q, choices: q.choices.filter((_, cI) => cI !== choiceIndex) }
        : q
    ))
  }

  const updateChoice = (questionIndex: number, choiceIndex: number, newChoice: string) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? { 
            ...q, 
            choices: q.choices.map((c, cI) => 
              cI === choiceIndex ? newChoice : c
            ) 
          }
        : q
    ))
  }

  const validateQuestions = (questionsToValidate: SurveyQuestion[]) => {
    return questionsToValidate.every(q => 
      q.question.trim() !== "" && 
      q.choices.length >= 2 &&
      q.choices.every(c => c.trim() !== "")
    )
  }

  const validateSurveyDetails = () => {
    if (!surveyName.trim()) {
      toast.error("Please enter a survey name")
      return false
    }
    if (!surveyDescription.trim()) {
      toast.error("Please enter a survey description")
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (!validateSurveyDetails()) {
      return
    }
    
    if (!validateQuestions(questions)) {
      toast.error("Please complete all questions with at least 2 choices each")
      return
    }

    onSubmit({
      name: surveyName,
      description: surveyDescription,
      surveyQuestions: questions
    })
  }

  // Component for choice input
  const ChoiceInput = ({
    choice,
    index,
    questionIndex,
    canRemove
  }: {
    choice: string;
    index: number;
    questionIndex: number;
    canRemove: boolean;
  }) => (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
        {String.fromCharCode(65 + index)}
      </div>
      <Input
        value={choice}
        onChange={(e) => updateChoice(questionIndex, index, e.target.value)}
        placeholder={`Choice ${index + 1}`}
        className="flex-1"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeChoice(questionIndex, index)}
        disabled={!canRemove}
        className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

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
          <h2 className="text-2xl font-bold">Create New Survey</h2>
          <p className="text-gray-600 mt-1">
            Create multiple-choice survey questions for trainees to provide feedback
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
        {/* Left Column: Form */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Survey Details</h3>
            </div>
            <div className="space-y-6">
              {/* Survey Name & Description */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="surveyName">Survey Name</Label>
                  <Input
                    id="surveyName"
                    value={surveyName}
                    onChange={(e) => setSurveyName(e.target.value)}
                    placeholder="Enter survey name"
                    className="w-full mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="surveyDescription">Description</Label>
                  <Textarea
                    id="surveyDescription"
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Enter survey description"
                    className="w-full mt-1"
                    rows={3}
                  />
                </div>
              </div>
              
              {/* Questions Section */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-medium mb-4">Survey Questions</h4>
                
                {questions.map((q, questionIndex) => (
                  <div key={questionIndex} className="space-y-4 mb-8">
                    <div className="mb-4">
                      <div className="flex justify-between">
                        <label className="block text-sm font-medium mb-1">
                          Question {questionIndex + 1}
                        </label>
                        {questionIndex > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(questionIndex)}
                            className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={q.question}
                        onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
                        placeholder="Enter your question"
                        className="w-full"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Answer Choices</label>
                      <div className="space-y-3">
                        {q.choices.map((choice, choiceIndex) => (
                          <ChoiceInput
                            key={choiceIndex}
                            choice={choice}
                            index={choiceIndex}
                            questionIndex={questionIndex}
                            canRemove={q.choices.length > 2}
                          />
                        ))}
                        {q.choices.length < 6 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addChoice(questionIndex)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Choice
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Button to add questions */}
                <Button 
                  onClick={addQuestion} 
                  variant="outline" 
                  className="flex items-center gap-2 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Question
                </Button>
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
                  {isSubmitting ? "Creating..." : "Save Survey"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Preview */}
        <div>
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Preview</h3>
            </div>
            <div className="space-y-6">
              {/* Survey Details Preview */}
              {(surveyName || surveyDescription) && (
                <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                  <h4 className="font-medium mb-2">{surveyName || "Survey Name"}</h4>
                  <p className="text-sm text-gray-600">{surveyDescription || "Survey description will appear here"}</p>
                </div>
              )}
              
              {/* Questions Preview */}
              {questions.map((q, questionIndex) => (
                <Card key={questionIndex} className="bg-gray-50 border p-6">
                  <h3 className="text-lg font-medium mb-4">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full mr-2 text-sm">
                      {questionIndex + 1}
                    </span>
                    {q.question || "Your question will appear here"}
                  </h3>
                  <div className="space-y-3 pl-9">
                    {q.choices.map((choice, choiceIdx) => (
                      <PreviewChoice 
                        key={choiceIdx} 
                        choice={choice} 
                        index={choiceIdx} 
                      />
                    ))}
                  </div>
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Add questions to see them previewed here
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 