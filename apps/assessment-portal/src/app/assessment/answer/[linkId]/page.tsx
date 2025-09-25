"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useCheckAssessmentLinkValidity, useStartAssessment, useSaveAssessmentAnswers, useSubmitAssessment, type AssessmentAnswer, type AssessmentAttempt } from "@/lib/hooks/useAssessmentLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "@/components/Timer";
import { QuestionCard } from "@/components/QuestionCard";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, User, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function AssessmentAnswerPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.linkId as string;

  const [assessmentAttempt, setAssessmentAttempt] = useState<AssessmentAttempt | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [isStarted, setIsStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Hooks
  const { data: validityData, isLoading: checkingValidity, error: validityError } = useCheckAssessmentLinkValidity(linkId);
  const startAssessmentMutation = useStartAssessment();
  const saveAnswersMutation = useSaveAssessmentAnswers();
  const submitAssessmentMutation = useSubmitAssessment();

  const assessmentLink = validityData?.assessmentLink;
  const assessment = assessmentLink?.assessment;
  const isValid = assessmentLink?.valid;
  const isExpired = !isValid && validityError;

  // Calculate progress
  const totalQuestions = assessment?.sections.reduce((acc, section) => acc + section.questions.length, 0) || 0;
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Get current section and question
  const currentSection = assessment?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];

  const handleSubmit = useCallback(async () => {
    try {
      await submitAssessmentMutation.mutateAsync(linkId);
      router.push('/');
    } catch (error) {
      console.error("Failed to submit assessment:", error);
    }
  }, [submitAssessmentMutation, linkId, router]);

  useEffect(() => {
    if (assessmentAttempt?.startedAt && assessment?.timed && !isTimeUp) {
      const startTime = new Date(assessmentAttempt.startedAt).getTime();
      const durationMs = assessment.duration * 60 * 1000; // Convert minutes to milliseconds
      const endTime = startTime + durationMs;
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(Math.ceil(remaining / 1000)); // Convert to seconds
        
        if (remaining <= 0 && !isTimeUp) {
          setIsTimeUp(true);
          toast.error("Time is up! Assessment time has expired.");
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [assessmentAttempt, assessment, isTimeUp]);

  const handleStartAssessment = async () => {
    try {
      const result = await startAssessmentMutation.mutateAsync(linkId);
      setAssessmentAttempt(result.assessmentAttempt);
      setIsStarted(true);
      toast.success("Assessment started!");
    } catch (error) {
      console.error("Failed to start assessment:", error);
    }
  };

  const handleAnswerChange = async (questionId: string, answer: AssessmentAnswer) => {
    // Don't allow answers when time is up
    if (isTimeUp) {
      toast.warning("Time is up! You can no longer modify your answers.");
      return;
    }

    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);

    // Auto-save answers
    try {
      await saveAnswersMutation.mutateAsync({
        linkId,
        assessmentAnswers: Object.values(updatedAnswers)
      });
    } catch (error) {
      console.error("Failed to auto-save answers:", error);
    }
  };

  const navigateToQuestion = (sectionIndex: number, questionIndex: number) => {
    if (isTimeUp) {
      toast.warning("Time is up! Navigation is no longer available.");
      return;
    }
    setCurrentSectionIndex(sectionIndex);
    setCurrentQuestionIndex(questionIndex);
  };

  const handleNext = () => {
    if (!currentSection || isTimeUp) return;
    
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < (assessment?.sections.length || 0) - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrevious = () => {
    if (isTimeUp) return;
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex((assessment?.sections[currentSectionIndex - 1].questions.length || 1) - 1);
    }
  };


  // Loading state
  if (checkingValidity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking assessment link validity...</p>
        </div>
      </div>
    );
  }

  // Error or invalid link
  if (!isValid || isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Assessment Link Invalid</h2>
            <p className="text-muted-foreground mb-6">
              {validityError ? "This assessment link has expired or is no longer valid." : "Unable to access this assessment."}
            </p>
            <Button onClick={() => router.push('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-assessment screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">Assessment Portal</p>
              <CardTitle className="text-3xl font-bold text-foreground">{assessment?.name}</CardTitle>
              {assessment?.description && (
                <p className="text-muted-foreground mt-2">{assessment.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="bg-muted p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4 text-center text-foreground">Assessment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card p-3 rounded-md flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Student</p>
                      <p className="font-medium text-foreground">{assessmentLink?.traineeName}</p>
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded-md flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
                      <p className="font-medium text-foreground">
                        {assessment?.timed ? `${assessment.duration} minutes` : "No time limit"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded-md flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                      <p className="font-medium text-foreground">{assessmentLink?.linkType.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded-md flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-muted-foreground">{totalQuestions}</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Questions</p>
                      <p className="font-medium text-foreground">{totalQuestions} Total</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-accent p-6 rounded-lg border">
                <h4 className="font-semibold text-lg text-foreground mb-4 text-center">📋 Instructions</h4>
                <ul className="text-muted-foreground space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <span>Read each question carefully before answering</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <span>Your answers will be automatically saved as you progress</span>
                  </li>
                  {assessment?.timed && (
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">⏰</span>
                      <span>The timer will start once you begin - manage your time wisely</span>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <span>Navigate between questions using the sidebar or navigation buttons</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    <span>Click &quot;Submit Assessment&quot; when you&apos;re ready to finish</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleStartAssessment}
                  disabled={startAssessmentMutation.isPending}
                  size="lg"
                  className="px-12 py-3"
                >
                  {startAssessmentMutation.isPending ? "Starting..." : "🚀 Start Assessment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Time up screen
  if (isTimeUp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full mx-auto">
          <Card className="shadow-lg border-destructive/20">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-3xl font-bold text-destructive">Time is Up!</CardTitle>
              <p className="text-muted-foreground mt-2">
                The assessment time has expired. You can no longer modify your answers.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="bg-muted/50 p-6 rounded-lg border text-center">
                <h3 className="font-semibold text-lg mb-4 text-foreground">Assessment Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Questions Answered</p>
                    <p className="text-2xl font-bold text-primary/70">{answeredQuestions}/{totalQuestions}</p>
                  </div>
                  <div className="bg-card p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold text-primary/70">{Math.round(progressPercentage)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center">
                <p className="text-amber-800 font-medium mb-2">⚠️ Important Notice</p>
                <p className="text-amber-700 text-sm">
                  Time has expired for this assessment. If you wish to submit your current answers, 
                  you must do so through your instructor or assessment administrator.
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => router.push('/')}
                  variant="outline"
                  size="lg"
                  className="px-12 py-3"
                >
                  Exit Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Assessment in progress
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{assessment?.name}</h1>
                <p className="text-sm text-muted-foreground font-medium">{assessmentLink?.traineeName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {assessment?.timed && timeRemaining !== null && (
                <Timer timeRemaining={timeRemaining} />
              )}
              <div className="text-right bg-muted px-4 py-2 rounded-lg border">
                <p className="text-sm font-medium text-foreground">Progress</p>
                <p className="text-lg font-bold text-primary/70">{answeredQuestions}/{totalQuestions}</p>
                <p className="text-xs text-muted-foreground">questions answered</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Overall Progress</span>
              <span className="font-bold text-primary/70">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3 [&>div]:bg-primary/60" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Assessment Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border shadow-sm sticky top-6">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-foreground">Assessment Structure</h3>
              </div>
              
              <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Assessment Info */}
                <div className="p-3 rounded-lg bg-muted border">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">📋</span>
                    <span className="font-medium text-sm text-foreground">Assessment Progress</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {answeredQuestions}/{totalQuestions} questions completed
                  </p>
                </div>

                {/* Sections */}
                {assessment?.sections.map((section, sectionIndex) => (
                  <div key={section.id} className="bg-accent rounded-lg border">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-lg">📁</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-foreground">
                            {section.title}
                          </h4>
                          {section.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      {section.questions.map((question, questionIndex) => {
                        const isAnswered = answers[question.id];
                        const isCurrent = sectionIndex === currentSectionIndex && questionIndex === currentQuestionIndex;
                        
                        return (
                          <div
                            key={question.id}
                            className={clsx(
                              "p-2 rounded cursor-pointer transition-all",
                              {
                                "bg-primary/10 border border-primary shadow-sm": isCurrent,
                                "bg-primary/5": isAnswered && !isCurrent,
                                "hover:bg-primary/5": !isCurrent,
                              }
                            )}
                            onClick={() => navigateToQuestion(sectionIndex, questionIndex)}
                          >
                            <div className="flex items-center gap-2">
                              <img 
                                src={`/question-type-${question.questionType.toLowerCase()}.svg`}
                                alt={`${question.questionType} icon`}
                                className="w-4 h-4"
                                onError={(e) => {
                                  e.currentTarget.src = question.questionType === 'RADIO' ? '/question-type-radio.svg' : '/question-type-checkbox.svg'
                                }}
                              />
                              <span className="text-sm font-medium text-foreground">
                                Q{questionIndex + 1}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Weight: {question.weight}
                              </span>
                              {isAnswered && (
                                <div className="w-2 h-2 bg-primary rounded-full ml-auto"></div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {question.question || 'Untitled question'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            {currentSection && currentQuestion && (
              <>
                {/* Section Info - Exam Paper Style */}
                <div className="mb-6 border-b-2 border-dashed border-muted-foreground/20 pb-4">
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border-l-4 border-primary/20 shadow-sm">
                    <div className="text-center mb-3">
                      <h1 className="text-2xl font-bold text-foreground uppercase tracking-wide">
                        SECTION {currentSection.sectionNumber}
                      </h1>
                      <div className="w-16 h-0.5 bg-primary/40 mx-auto mt-1 rounded"></div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h2 className="text-lg font-semibold text-foreground">
                        {currentSection.title}
                      </h2>
                      
                      {currentSection.description && (
                        <div className="bg-muted/30 p-3 rounded border-l-2 border-primary/20">
                          <p className="text-sm text-muted-foreground leading-relaxed italic">
                            &quot;{currentSection.description}&quot;
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-center items-center gap-6 mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                          <span>Question {currentQuestionIndex + 1} of {currentSection.questions.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                          <span>Weight: {currentQuestion.weight} points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Card */}
                <div className="flex justify-center">
                  <div className="w-full max-w-4xl">
                    <QuestionCard
                      question={currentQuestion}
                      value={answers[currentQuestion.id]}
                      onChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                      disabled={isTimeUp}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="mt-12 mb-8">
                  <div className="flex items-center justify-between py-6">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={(currentSectionIndex === 0 && currentQuestionIndex === 0) || isTimeUp}
                      size="lg"
                      className="px-8 py-3 text-base"
                    >
                      ← Previous
                    </Button>
                    
                    <div className="flex gap-4">
                      {/* Show Next if not last question */}
                      {!(currentSectionIndex === (assessment?.sections.length || 0) - 1 && 
                        currentQuestionIndex === (currentSection?.questions.length || 0) - 1) && (
                        <Button 
                          onClick={handleNext}
                          disabled={isTimeUp}
                          size="lg"
                          className="px-8 py-3 text-base"
                        >
                          Next →
                        </Button>
                      )}
                      
                        {/* Always show submit button */}
                        <Button
                          onClick={handleSubmit}
                          disabled={submitAssessmentMutation.isPending || isTimeUp}
                          variant={answeredQuestions === totalQuestions ? "default" : "outline"}
                          size="lg"
                          className="px-8 py-3 text-base font-semibold"
                        >
                          {isTimeUp 
                            ? "Time Expired" 
                            : submitAssessmentMutation.isPending 
                            ? "Submitting..." 
                            : "Submit Assessment"
                          }
                        </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
