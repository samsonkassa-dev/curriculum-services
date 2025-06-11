"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react"
import { useCreateTrainingSurvey } from "@/lib/hooks/useStaticSurvey"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

// Import types directly
import { 
  type FutureEndeavorImpact, 
  type PerspectiveInfluence, 
  type SatisfactionLevel,
  type TrainingClarity,
  type TrainingDuration,
  type CreateTrainingSurveyDTO
} from "@/lib/hooks/useStaticSurvey"

interface SurveyModalProps {
  isOpen: boolean
  onClose: () => void
  trainingId: string
  studentId: string
  studentName: string
  isPreSession: boolean
  onSurveyStatusChange: (status: boolean) => void
  onSubmitStart: () => void
}

export function SurveyModal({
  isOpen,
  onClose,
  trainingId,
  studentId,
  studentName,
  isPreSession,
  onSurveyStatusChange,
  onSubmitStart
}: SurveyModalProps) {
  // Form state
  const [step, setStep] = useState(1)
  const [futureEndeavorImpact, setFutureEndeavorImpact] = useState<FutureEndeavorImpact | null>(null)
  const [perspectiveInfluences, setPerspectiveInfluences] = useState<PerspectiveInfluence[]>([])
  const [overallSatisfaction, setOverallSatisfaction] = useState<SatisfactionLevel | null>(null)
  const [confidenceLevel, setConfidenceLevel] = useState("")
  const [recommendationRating, setRecommendationRating] = useState<number | null>(null)
  const [trainerDeliverySatisfaction, setTrainerDeliverySatisfaction] = useState<SatisfactionLevel | null>(null)
  const [overallQualitySatisfaction, setOverallQualitySatisfaction] = useState<SatisfactionLevel | null>(null)
  const [trainingClarity, setTrainingClarity] = useState<TrainingClarity | null>(null)
  const [trainingDurationFeedback, setTrainingDurationFeedback] = useState<TrainingDuration | null>(null)
  
  // UI states
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Mutation hook
  const { createTrainingSurvey, isSubmitting } = useCreateTrainingSurvey()
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setFutureEndeavorImpact(null)
      setPerspectiveInfluences([])
      setOverallSatisfaction(null)
      setConfidenceLevel("")
      setRecommendationRating(null)
      setTrainerDeliverySatisfaction(null)
      setOverallQualitySatisfaction(null)
      setTrainingClarity(null)
      setTrainingDurationFeedback(null)
      setError(null)
      setIsSubmitted(false)
    }
  }, [isOpen])
  
  // Calculate total steps based on session type
  const totalSteps = isPreSession ? 2 : 9
  
  // Compute current step validation
  const isCurrentStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return !!futureEndeavorImpact
      case 2:
        return perspectiveInfluences.length > 0
      case 3:
        return !!overallSatisfaction
      case 4:
        return confidenceLevel.trim().length > 0
      case 5:
        return recommendationRating !== null
      case 6:
        return !!trainerDeliverySatisfaction
      case 7:
        return !!overallQualitySatisfaction
      case 8:
        return !!trainingClarity
      case 9:
        return !!trainingDurationFeedback
      default:
        return false
    }
  }, [
    step, 
    futureEndeavorImpact, 
    perspectiveInfluences, 
    overallSatisfaction,
    confidenceLevel,
    recommendationRating,
    trainerDeliverySatisfaction,
    overallQualitySatisfaction,
    trainingClarity,
    trainingDurationFeedback
  ])
  
  // Helper to check if we're on the last step
  const isLastStep = step === totalSteps
  
  // Handle influence checkbox toggle
  const toggleInfluence = (influence: PerspectiveInfluence) => {
    setPerspectiveInfluences(prev => {
      if (prev.includes(influence)) {
        return prev.filter(i => i !== influence)
      } else {
        return [...prev, influence]
      }
    })
  }
  
  // Navigation handlers
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1)
    }
  }
  
  const handlePrevious = () => {
    if (step > 1) {
      setStep(prev => prev - 1)
    }
  }
  
  // Submit handler
  const handleSubmit = () => {
    // Validate all required fields
    if (!futureEndeavorImpact || perspectiveInfluences.length === 0) {
      setError("Please complete all required fields")
      return
    }
    
    // Additional validation for post-session surveys
    if (!isPreSession) {
      if (
        !overallSatisfaction ||
        confidenceLevel.trim() === "" ||
        recommendationRating === null ||
        !trainerDeliverySatisfaction ||
        !overallQualitySatisfaction ||
        !trainingClarity ||
        !trainingDurationFeedback
      ) {
        setError("Please complete all required fields")
        return
      }
    }
    
    // Prepare data for submission
    let surveyData: CreateTrainingSurveyDTO
    
    if (isPreSession) {
      // For pre-session, provide default values for required fields
      surveyData = {
        futureEndeavorImpact: futureEndeavorImpact!,
        perspectiveInfluences: perspectiveInfluences,
        overallSatisfaction: "NEUTRAL", // Default values
        confidenceLevel: "Not applicable - Pre-session",
        recommendationRating: 0,
        trainerDeliverySatisfaction: "NEUTRAL",
        overallQualitySatisfaction: "NEUTRAL",
        trainingClarity: "MODERATELY_CLEAR",
        trainingDurationFeedback: "JUST_RIGHT"
      }
    } else {
      // For post-session, use all collected values
      surveyData = {
        futureEndeavorImpact: futureEndeavorImpact!,
        perspectiveInfluences: perspectiveInfluences,
        overallSatisfaction: overallSatisfaction!,
        confidenceLevel: confidenceLevel,
        recommendationRating: recommendationRating!,
        trainerDeliverySatisfaction: trainerDeliverySatisfaction!,
        overallQualitySatisfaction: overallQualitySatisfaction!,
        trainingClarity: trainingClarity!,
        trainingDurationFeedback: trainingDurationFeedback!
      }
    }
    
    // Notify parent of submission start
    onSubmitStart()
    
    // Submit survey
    createTrainingSurvey(
      {
        trainingId,
        traineeId: studentId,
        surveyData
      },
      {
        onSuccess: () => {
          setIsSubmitted(true)
          onSurveyStatusChange(true) // Notify parent of successful submission
          
          // Close modal after success display
          setTimeout(() => {
            onClose()
          }, 1500)
        },
        onError: (error) => {
          // Handle error
          setError(error instanceof Error ? error.message : "Failed to submit survey")
          onSubmitStart() // Reset submission state in parent
        }
      }
    )
  }

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Do you believe this training will help you in your future endeavors like work, personal life or further learning?
            </h3>
            <RadioGroup 
              value={futureEndeavorImpact || ""} 
              onValueChange={(value) => setFutureEndeavorImpact(value as FutureEndeavorImpact)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="STRONGLY_DISAGREE" id="option1" />
                <Label htmlFor="option1">Strongly Disagree</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DISAGREE" id="option2" />
                <Label htmlFor="option2">Disagree</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEUTRAL" id="option3" />
                <Label htmlFor="option3">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AGREE" id="option4" />
                <Label htmlFor="option4">Agree</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="STRONGLY_AGREE" id="option5" />
                <Label htmlFor="option5">Strongly Agree</Label>
              </div>
            </RadioGroup>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              How has this training influenced your perspectives on education or career paths? (Select all that apply)
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="influence1" 
                  checked={perspectiveInfluences.includes("INCREASED_INTEREST_IN_EDUCATION")}
                  onCheckedChange={() => toggleInfluence("INCREASED_INTEREST_IN_EDUCATION")}
                />
                <Label htmlFor="influence1" className="leading-tight">
                  It has increased my interest in further education.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="influence2" 
                  checked={perspectiveInfluences.includes("CONSIDERING_NEW_CAREER_PATHS")}
                  onCheckedChange={() => toggleInfluence("CONSIDERING_NEW_CAREER_PATHS")}
                />
                <Label htmlFor="influence2" className="leading-tight">
                  It has made me consider new career paths.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="influence3" 
                  checked={perspectiveInfluences.includes("STRENGTHENED_CURRENT_PATH_CONFIDENCE")}
                  onCheckedChange={() => toggleInfluence("STRENGTHENED_CURRENT_PATH_CONFIDENCE")}
                />
                <Label htmlFor="influence3" className="leading-tight">
                  It has strengthened my confidence in my current career path.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="influence4" 
                  checked={perspectiveInfluences.includes("RECOGNIZED_CONTINUOUS_LEARNING_VALUE")}
                  onCheckedChange={() => toggleInfluence("RECOGNIZED_CONTINUOUS_LEARNING_VALUE")}
                />
                <Label htmlFor="influence4" className="leading-tight">
                  It has helped me see the value of continuous learning.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="influence5" 
                  checked={perspectiveInfluences.includes("NO_SIGNIFICANT_INFLUENCE")}
                  onCheckedChange={() => toggleInfluence("NO_SIGNIFICANT_INFLUENCE")}
                />
                <Label htmlFor="influence5" className="leading-tight">
                  It has not significantly influenced my perspectives.
                </Label>
              </div>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              How satisfied are you with the overall training experience?
            </h3>
            <RadioGroup 
              value={overallSatisfaction || ""} 
              onValueChange={(value) => setOverallSatisfaction(value as SatisfactionLevel)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VERY_DISSATISFIED" id="satisfaction1" />
                <Label htmlFor="satisfaction1">Very Dissatisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DISSATISFIED" id="satisfaction2" />
                <Label htmlFor="satisfaction2">Dissatisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEUTRAL" id="satisfaction3" />
                <Label htmlFor="satisfaction3">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SATISFIED" id="satisfaction4" />
                <Label htmlFor="satisfaction4">Satisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VERY_SATISFIED" id="satisfaction5" />
                <Label htmlFor="satisfaction5">Very Satisfied</Label>
              </div>
            </RadioGroup>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              What increase in self-reported confidence levels was noted after the training?
            </h3>
            <Input
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(e.target.value)}
              placeholder="Describe your confidence level after training..."
              className="w-full"
            />
          </div>
        )
      
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              How likely are you to recommend this training to others?
            </h3>
            <RadioGroup 
              value={recommendationRating?.toString() || ""} 
              onValueChange={(value) => setRecommendationRating(parseInt(value))}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="rating0" />
                <Label htmlFor="rating0">Not at all likely (0)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="rating1" />
                <Label htmlFor="rating1">1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="rating2" />
                <Label htmlFor="rating2">2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="rating3" />
                <Label htmlFor="rating3">3</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="rating4" />
                <Label htmlFor="rating4">4</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="rating5" />
                <Label htmlFor="rating5">Very likely (5)</Label>
              </div>
            </RadioGroup>
          </div>
        )
      
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              How satisfied were you with the trainer&apos;s delivery of the training content?
            </h3>
            <RadioGroup 
              value={trainerDeliverySatisfaction || ""} 
              onValueChange={(value) => setTrainerDeliverySatisfaction(value as SatisfactionLevel)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VERY_DISSATISFIED" id="trainer1" />
                <Label htmlFor="trainer1">Very Dissatisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DISSATISFIED" id="trainer2" />
                <Label htmlFor="trainer2">Dissatisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEUTRAL" id="trainer3" />
                <Label htmlFor="trainer3">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SATISFIED" id="trainer4" />
                <Label htmlFor="trainer4">Satisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VERY_SATISFIED" id="trainer5" />
                <Label htmlFor="trainer5">Very Satisfied</Label>
              </div>
            </RadioGroup>
          </div>
        )
      
      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              How satisfied were you with the overall quality of the training program?
            </h3>
            <RadioGroup 
              value={overallQualitySatisfaction || ""} 
              onValueChange={(value) => setOverallQualitySatisfaction(value as SatisfactionLevel)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VERY_DISSATISFIED" id="quality1" />
                <Label htmlFor="quality1">Very Dissatisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DISSATISFIED" id="quality2" />
                <Label htmlFor="quality2">Dissatisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEUTRAL" id="quality3" />
                <Label htmlFor="quality3">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SATISFIED" id="quality4" />
                <Label htmlFor="quality4">Satisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VERY_SATISFIED" id="quality5" />
                <Label htmlFor="quality5">Very Satisfied</Label>
              </div>
            </RadioGroup>
          </div>
        )
      
      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              How clear and easy to understand was the delivery of the training content?
            </h3>
            <RadioGroup 
              value={trainingClarity || ""} 
              onValueChange={(value) => setTrainingClarity(value as TrainingClarity)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NOT_AT_ALL_CLEAR" id="clarity1" />
                <Label htmlFor="clarity1">Not at all clear</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SLIGHTLY_CLEAR" id="clarity2" />
                <Label htmlFor="clarity2">Slightly clear</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MODERATELY_CLEAR" id="clarity3" />
                <Label htmlFor="clarity3">Moderately clear</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CLEAR" id="clarity4" />
                <Label htmlFor="clarity4">Clear</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VERY_CLEAR" id="clarity5" />
                <Label htmlFor="clarity5">Very clear</Label>
              </div>
            </RadioGroup>
          </div>
        )
      
      case 9:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Do you feel the duration of the training was appropriate for the content covered?
            </h3>
            <RadioGroup 
              value={trainingDurationFeedback || ""} 
              onValueChange={(value) => setTrainingDurationFeedback(value as TrainingDuration)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="TOO_SHORT" id="duration1" />
                <Label htmlFor="duration1">Too Short</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="JUST_RIGHT" id="duration2" />
                <Label htmlFor="duration2">Just Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="TOO_LONG" id="duration3" />
                <Label htmlFor="duration3">Too Long</Label>
              </div>
            </RadioGroup>
          </div>
        )
      
      default:
        return null
    }
  }
  
  // Success content when survey is submitted
  const renderSuccessContent = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-green-700 mb-2">Survey Submitted!</h3>
      <p className="text-gray-600 text-center">Thank you for completing the survey.</p>
    </div>
  )
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isPreSession ? "Pre-Training Survey" : "Post-Training Survey"} - {studentName}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          {isSubmitted ? (
            renderSuccessContent()
          ) : (
            <div className="py-4">
              {/* Progress indicator */}
              <div className="flex items-center mb-6">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-600">{step}/{totalSteps}</span>
              </div>
              
              {/* Current step content */}
              {renderStepContent()}
              
              {/* Error display */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        {!isSubmitted && (
          <DialogFooter className="flex justify-between">
            <div>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1 || isSubmitting}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            </div>
            <div>
              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentStepValid || isSubmitting}
                  className="bg-[#0B75FF] hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                  ) : (
                    "Submit"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                  className="bg-[#0B75FF] hover:bg-blue-700 text-white"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
} 