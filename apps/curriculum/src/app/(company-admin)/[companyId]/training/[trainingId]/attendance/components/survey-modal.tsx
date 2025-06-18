"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react"
import { useCreateTrainingSurvey, useUpdateTrainingSurvey, useTrainingSurvey } from "@/lib/hooks/useStaticSurvey"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

// Import types directly
import type { 
  FutureEndeavorImpact, 
  PerspectiveInfluence, 
  SatisfactionLevel, 
  TrainingClarity, 
  TrainingDuration,
  CreateTrainingSurveyDTO,
  CreatePreSurveyDTO,
  CreatePostSurveyDTO,
  UpdateTrainingSurveyDTO,
  SurveyType
} from "@/lib/hooks/useStaticSurvey"

export interface SurveyModalProps {
  isOpen: boolean
  onClose: () => void
  trainingId: string
  studentId: string
  studentName: string
  isPreSession: boolean
  existingSurveyId: string | null
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
  existingSurveyId,
  onSurveyStatusChange,
  onSubmitStart
}: SurveyModalProps) {
  // Brand radio button styling
  const radioButtonStyle = "text-[#0B75FF] border-[#0B75FF] focus:ring-[#0B75FF] data-[state=checked]:bg-[#0B75FF] data-[state=checked]:border-[#0B75FF] data-[state=checked]:text-white"
  // State
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Form state
  const [futureEndeavorImpact, setFutureEndeavorImpact] = useState<FutureEndeavorImpact | null>(null)
  const [perspectiveInfluences, setPerspectiveInfluences] = useState<PerspectiveInfluence[]>([])
  const [overallSatisfaction, setOverallSatisfaction] = useState<SatisfactionLevel | null>(null)
  const [confidenceLevel, setConfidenceLevel] = useState("")
  const [recommendationRating, setRecommendationRating] = useState<number | null>(null)
  const [trainerDeliverySatisfaction, setTrainerDeliverySatisfaction] = useState<SatisfactionLevel | null>(null)
  const [overallQualitySatisfaction, setOverallQualitySatisfaction] = useState<SatisfactionLevel | null>(null)
  const [trainingClarity, setTrainingClarity] = useState<TrainingClarity | null>(null)
  const [trainingDurationFeedback, setTrainingDurationFeedback] = useState<TrainingDuration | null>(null)
  
  // Mutation hook
  const { createTrainingSurvey, isSubmitting: isCreating } = useCreateTrainingSurvey()
  const { updateTrainingSurvey, isUpdating } = useUpdateTrainingSurvey()
  
  // Fetch existing survey data if editing
  const { data: existingSurvey, isLoading: isLoadingExistingSurvey } = useTrainingSurvey(
    existingSurveyId || ''
  )
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setError(null)
      setIsSubmitted(false)
      
      if (!existingSurveyId) {
        // Only reset form if not editing an existing survey
        setFutureEndeavorImpact(null)
        setPerspectiveInfluences([])
        setOverallSatisfaction(null)
        setConfidenceLevel("")
        setRecommendationRating(null)
        setTrainerDeliverySatisfaction(null)
        setOverallQualitySatisfaction(null)
        setTrainingClarity(null)
        setTrainingDurationFeedback(null)
      }
    }
  }, [isOpen, existingSurveyId])
  
  // Populate form with existing data when available
  useEffect(() => {
    if (existingSurvey) {
      setFutureEndeavorImpact(existingSurvey.futureEndeavorImpact)
      setPerspectiveInfluences(existingSurvey.perspectiveInfluences || [])
      setOverallSatisfaction(existingSurvey.overallSatisfaction)
      setConfidenceLevel(existingSurvey.confidenceLevel || "")
      
      // Only set post-survey fields if they exist (not null)
      if (existingSurvey.recommendationRating !== null) {
        setRecommendationRating(existingSurvey.recommendationRating)
      }
      if (existingSurvey.trainerDeliverySatisfaction !== null) {
        setTrainerDeliverySatisfaction(existingSurvey.trainerDeliverySatisfaction)
      }
      if (existingSurvey.overallQualitySatisfaction !== null) {
        setOverallQualitySatisfaction(existingSurvey.overallQualitySatisfaction)
      }
      if (existingSurvey.trainingClarity !== null) {
        setTrainingClarity(existingSurvey.trainingClarity)
      }
      if (existingSurvey.trainingDurationFeedback !== null) {
        setTrainingDurationFeedback(existingSurvey.trainingDurationFeedback)
      }
    }
  }, [existingSurvey])
  
  // Calculate total steps based on session type
  const totalSteps = isPreSession ? 4 : 9
  
  // Validation logic for each step
  const isCurrentStepValid = () => {
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
        return !!recommendationRating
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
  }
  
  // Navigation handlers
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else if (isCurrentStepValid()) {
      handleSubmit()
    }
  }
  
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }
  
  // Perspective influences handler
  const handlePerspectiveChange = (value: PerspectiveInfluence, checked: boolean) => {
    if (checked) {
      setPerspectiveInfluences(prev => [...prev, value])
    } else {
      setPerspectiveInfluences(prev => prev.filter(v => v !== value))
    }
  }
  
  // Slider value handler
  const handleSliderChange = (value: number[]) => {
    setConfidenceLevel(value[0].toString())
  }
  
  // Submit handler
  const handleSubmit = () => {
    if (!isCurrentStepValid()) return
    
    try {
      let surveyData: CreateTrainingSurveyDTO
      const surveyTypeValue: SurveyType = isPreSession ? "PRE" : "POST"
      
      if (existingSurveyId) {
        // Update existing survey - always send complete object with nulls for unused fields
        const updateData: UpdateTrainingSurveyDTO = {
          futureEndeavorImpact: futureEndeavorImpact!,
          perspectiveInfluences: perspectiveInfluences,
          overallSatisfaction: overallSatisfaction!,
          confidenceLevel: confidenceLevel,
          // For pre-session surveys, these will be null
          recommendationRating: isPreSession ? null : (recommendationRating || null),
          trainerDeliverySatisfaction: isPreSession ? null : (trainerDeliverySatisfaction || null),
          overallQualitySatisfaction: isPreSession ? null : (overallQualitySatisfaction || null),
          trainingClarity: isPreSession ? null : (trainingClarity || null),
          trainingDurationFeedback: isPreSession ? null : (trainingDurationFeedback || null)
        }
        
        updateTrainingSurvey(
          { 
            surveyId: existingSurveyId, 
            surveyData: updateData 
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
              setError(error instanceof Error ? error.message : "Failed to update survey")
              onSubmitStart() // Reset submission state in parent
            }
          }
        )
      } else {
        // Create new survey
        if (isPreSession) {
          surveyData = {
            futureEndeavorImpact: futureEndeavorImpact!,
            perspectiveInfluences: perspectiveInfluences,
            overallSatisfaction: overallSatisfaction!,
            confidenceLevel: confidenceLevel
          } as CreatePreSurveyDTO
        } else {
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
          } as CreatePostSurveyDTO
        }
        
        onSubmitStart()
        
        createTrainingSurvey(
          { 
            trainingId, 
            traineeId: studentId, 
            surveyData,
            surveyType: surveyTypeValue
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      onSubmitStart() // Reset submission state in parent
    }
  }

  // Calculate progress percentage
  const progressPercentage = Math.round((step / totalSteps) * 100)
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isPreSession ? "Pre-Session" : "Post-Session"} Survey for {studentName}
          </DialogTitle>
        </DialogHeader>
        
        {isLoadingExistingSurvey ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading survey data...</p>
          </div>
        ) : isSubmitted ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-green-700 mb-2">
              Survey {existingSurveyId ? "Updated" : "Submitted"} Successfully
            </h3>
            <p className="text-center text-gray-600">
              Thank you for providing your feedback!
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-red-700 mb-2">Error</h3>
            <p className="text-center text-gray-600 mb-4">{error}</p>
            <Button onClick={() => setError(null)}>Try Again</Button>
          </div>
        ) : (
          <>
            {/* Progress indicator */}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
              <div 
                className="bg-blue-500 h-full transition-all duration-300 ease-in-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <ScrollArea className="flex-1 px-1">
              <div className="space-y-6 py-2">
                {/* Step 1: Future Endeavor Impact */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Has this training positively impacted how you approach your future endeavors?
                    </h3>
                    <RadioGroup 
                      value={futureEndeavorImpact || ""} 
                      onValueChange={(value) => setFutureEndeavorImpact(value as FutureEndeavorImpact)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="STRONGLY_DISAGREE" id="impact-1" className={radioButtonStyle} />
                          <Label htmlFor="impact-1">Strongly Disagree</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="DISAGREE" id="impact-2" className={radioButtonStyle} />
                          <Label htmlFor="impact-2">Disagree</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="NEUTRAL" id="impact-3" className={radioButtonStyle} />
                          <Label htmlFor="impact-3">Neutral</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="AGREE" id="impact-4" className={radioButtonStyle} />
                          <Label htmlFor="impact-4">Agree</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="STRONGLY_AGREE" id="impact-5" className={radioButtonStyle} />
                          <Label htmlFor="impact-5">Strongly Agree</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}
                
                {/* Step 2: Perspective Influences */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      How has this training influenced your perspective? (Select all that apply)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="influence-1" 
                          checked={perspectiveInfluences.includes("INCREASED_INTEREST_IN_EDUCATION")}
                          onCheckedChange={(checked) => 
                            handlePerspectiveChange("INCREASED_INTEREST_IN_EDUCATION", !!checked)
                          }
                        />
                        <Label htmlFor="influence-1">Increased my interest in education</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="influence-2" 
                          checked={perspectiveInfluences.includes("CONSIDERING_NEW_CAREER_PATHS")}
                          onCheckedChange={(checked) => 
                            handlePerspectiveChange("CONSIDERING_NEW_CAREER_PATHS", !!checked)
                          }
                        />
                        <Label htmlFor="influence-2">Made me consider new career paths</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="influence-3" 
                          checked={perspectiveInfluences.includes("STRENGTHENED_CURRENT_PATH_CONFIDENCE")}
                          onCheckedChange={(checked) => 
                            handlePerspectiveChange("STRENGTHENED_CURRENT_PATH_CONFIDENCE", !!checked)
                          }
                        />
                        <Label htmlFor="influence-3">Strengthened my confidence in my current path</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="influence-4" 
                          checked={perspectiveInfluences.includes("RECOGNIZED_CONTINUOUS_LEARNING_VALUE")}
                          onCheckedChange={(checked) => 
                            handlePerspectiveChange("RECOGNIZED_CONTINUOUS_LEARNING_VALUE", !!checked)
                          }
                        />
                        <Label htmlFor="influence-4">Helped me recognize the value of continuous learning</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="influence-5" 
                          checked={perspectiveInfluences.includes("NO_SIGNIFICANT_INFLUENCE")}
                          onCheckedChange={(checked) => 
                            handlePerspectiveChange("NO_SIGNIFICANT_INFLUENCE", !!checked)
                          }
                        />
                        <Label htmlFor="influence-5">No significant influence on my perspective</Label>
                      </div>
                    </div>
                  </div>
                )}

                
                
                {/* Step 3: Overall Satisfaction - Show for both PRE and POST */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      How satisfied are you with the overall training experience so far?
                    </h3>
                    <RadioGroup 
                      value={overallSatisfaction || ""} 
                      onValueChange={(value) => setOverallSatisfaction(value as SatisfactionLevel)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="VERY_DISSATISFIED" id="satisfaction-1" className={radioButtonStyle} />
                          <Label htmlFor="satisfaction-1">Very Dissatisfied</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="DISSATISFIED" id="satisfaction-2" className={radioButtonStyle} />
                          <Label htmlFor="satisfaction-2">Dissatisfied</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="NEUTRAL" id="satisfaction-3" className={radioButtonStyle} />
                          <Label htmlFor="satisfaction-3">Neutral</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="SATISFIED" id="satisfaction-4" className={radioButtonStyle} />
                          <Label htmlFor="satisfaction-4">Satisfied</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="VERY_SATISFIED" id="satisfaction-5" className={radioButtonStyle} />
                          <Label htmlFor="satisfaction-5">Very Satisfied</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Step 4: Confidence Level - Show for both PRE and POST */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {isPreSession ? "How confident do you feel about the upcoming training content?" : "How confident do you feel about applying what you've learned?"}
                    </h3>
                    <div className="space-y-4">
                      <Input
                        value={confidenceLevel}
                        onChange={(e) => setConfidenceLevel(e.target.value)}
                        placeholder="Describe your confidence level..."
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
                
                {/* Only show the following steps for post-session surveys */}
                {!isPreSession && (
                  <>
                    {/* Step 5: Recommendation Rating */}
                    {step === 5 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          How likely are you to recommend this training to others? (1-10)
                        </h3>
                        <div className="space-y-6">
                          <Slider
                            value={[recommendationRating || 5]}
                            min={1}
                            max={10}
                            step={1}
                            onValueChange={(value) => setRecommendationRating(value[0])}
                          />
                          <div className="flex justify-between">
                            <span>Not Likely (1)</span>
                            <span className="font-medium">{recommendationRating || 5}</span>
                            <span>Very Likely (10)</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Step 6: Trainer Delivery Satisfaction */}
                    {step === 6 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          How satisfied were you with the trainer&apos;s delivery of the training content?
                        </h3>
                        <RadioGroup 
                          value={trainerDeliverySatisfaction || ""} 
                          onValueChange={(value) => setTrainerDeliverySatisfaction(value as SatisfactionLevel)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="VERY_DISSATISFIED" id="trainer-1" className={radioButtonStyle} />
                              <Label htmlFor="trainer-1">Very Dissatisfied</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="DISSATISFIED" id="trainer-2" className={radioButtonStyle} />
                              <Label htmlFor="trainer-2">Dissatisfied</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NEUTRAL" id="trainer-3" className={radioButtonStyle} />
                              <Label htmlFor="trainer-3">Neutral</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="SATISFIED" id="trainer-4" className={radioButtonStyle} />
                              <Label htmlFor="trainer-4">Satisfied</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="VERY_SATISFIED" id="trainer-5" className={radioButtonStyle} />
                              <Label htmlFor="trainer-5">Very Satisfied</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                    
                    {/* Step 7: Overall Quality Satisfaction */}
                    {step === 7 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          How satisfied were you with the overall quality of the training materials?
                        </h3>
                        <RadioGroup 
                          value={overallQualitySatisfaction || ""} 
                          onValueChange={(value) => setOverallQualitySatisfaction(value as SatisfactionLevel)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="VERY_DISSATISFIED" id="quality-1" className={radioButtonStyle} />
                              <Label htmlFor="quality-1">Very Dissatisfied</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="DISSATISFIED" id="quality-2" className={radioButtonStyle} />
                              <Label htmlFor="quality-2">Dissatisfied</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NEUTRAL" id="quality-3" className={radioButtonStyle} />
                              <Label htmlFor="quality-3">Neutral</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="SATISFIED" id="quality-4" className={radioButtonStyle} />
                              <Label htmlFor="quality-4">Satisfied</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="VERY_SATISFIED" id="quality-5" className={radioButtonStyle} />
                              <Label htmlFor="quality-5">Very Satisfied</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                    
                    {/* Step 8: Training Clarity */}
                    {step === 8 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          How clear was the training content?
                        </h3>
                        <RadioGroup 
                          value={trainingClarity || ""} 
                          onValueChange={(value) => setTrainingClarity(value as TrainingClarity)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NOT_AT_ALL_CLEAR" id="clarity-1" className={radioButtonStyle} />
                              <Label htmlFor="clarity-1">Not at all clear</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="SLIGHTLY_CLEAR" id="clarity-2" className={radioButtonStyle} />
                              <Label htmlFor="clarity-2">Slightly clear</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="MODERATELY_CLEAR" id="clarity-3" className={radioButtonStyle} />
                              <Label htmlFor="clarity-3">Moderately clear</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="CLEAR" id="clarity-4" className={radioButtonStyle} />
                              <Label htmlFor="clarity-4">Clear</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="VERY_CLEAR" id="clarity-5" className={radioButtonStyle} />
                              <Label htmlFor="clarity-5">Very clear</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                    
                    {/* Step 9: Training Duration Feedback */}
                    {step === 9 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          How was the duration of the training?
                        </h3>
                        <RadioGroup 
                          value={trainingDurationFeedback || ""} 
                          onValueChange={(value) => setTrainingDurationFeedback(value as TrainingDuration)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="TOO_SHORT" id="duration-1" className={radioButtonStyle} />
                              <Label htmlFor="duration-1">Too short</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="JUST_RIGHT" id="duration-2" className={radioButtonStyle} />
                              <Label htmlFor="duration-2">Just right</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="TOO_LONG" id="duration-3" className={radioButtonStyle} />
                              <Label htmlFor="duration-3">Too long</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
            
            <DialogFooter className="pt-4 flex items-center justify-between w-full">
              <div>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={step === 1 || isCreating || isUpdating}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Step {step} of {totalSteps}
              </div>
              <div>
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid() || isCreating || isUpdating}
                  className="bg-[#0B75FF] hover:bg-blue-700 text-white"
                >
                  {step === totalSteps ? (
                    isCreating || isUpdating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                    ) : (
                      existingSurveyId ? "Update Survey" : "Submit Survey"
                    )
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 