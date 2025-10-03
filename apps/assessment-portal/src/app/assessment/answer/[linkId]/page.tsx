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
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [isStarted, setIsStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<AssessmentAttempt | null>(null);

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
  const allQuestionsAnswered = answeredQuestions === totalQuestions && totalQuestions > 0;

  // Get current section and question
  const currentSection = assessment?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];

  const handleSubmit = useCallback(async () => {
    try {
      const result = await submitAssessmentMutation.mutateAsync(linkId);
      setSubmittedResult(result.assessmentAttempt);
    } catch (error) {
      console.error("Failed to submit assessment:", error);
    }
  }, [submitAssessmentMutation, linkId]);

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
      
      // Store best score if provided (for POST assessments)
      if (result.bestScore !== undefined) {
        setBestScore(result.bestScore);
      }
      
      // Restore previously saved answers if they exist
      if (result.assessmentAttempt.assessmentAnswers && result.assessmentAttempt.assessmentAnswers.length > 0) {
        const restoredAnswers: Record<string, AssessmentAnswer> = {};
        result.assessmentAttempt.assessmentAnswers.forEach((answer: {
          assessmentEntryId: string;
          selectedChoices?: Array<{ id: string; choiceText: string; choiceImageUrl: string | null; isCorrect: boolean | null }>;
          textAnswer?: string | null;
        }) => {
          // Transform backend format to frontend format
          // Backend returns: { selectedChoices: [{ id, choiceText, ... }], textAnswer }
          // Frontend expects: { selectedChoiceIds: [id1, id2, ...], textAnswer }
          restoredAnswers[answer.assessmentEntryId] = {
            assessmentEntryId: answer.assessmentEntryId,
            selectedChoiceIds: answer.selectedChoices?.map((choice) => choice.id) || [],
            textAnswer: answer.textAnswer || undefined
          };
        });
        setAnswers(restoredAnswers);
        toast.info(`Restored ${result.assessmentAttempt.assessmentAnswers.length} saved answer${result.assessmentAttempt.assessmentAnswers.length === 1 ? '' : 's'}`);
      }

      setIsStarted(true);
      toast.success(result.assessmentAttempt.attemptStatus === 'IN_PROGRESS' ? "Continuing assessment..." : "Assessment started!");
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

    // Auto-save answers - only send valid/complete answers
    try {
      // Filter out incomplete answers (empty selectedChoiceIds for RADIO/CHECKBOX, empty/undefined textAnswer for TEXT)
      const validAnswers = Object.values(updatedAnswers).filter(ans => {
        // TEXT questions must have textAnswer
        if (ans.textAnswer !== undefined && ans.textAnswer !== null) {
          return ans.textAnswer.trim().length > 0;
        }
        // RADIO/CHECKBOX questions must have at least one choice selected
        return ans.selectedChoiceIds && ans.selectedChoiceIds.length > 0;
      });

      if (validAnswers.length > 0) {
        await saveAnswersMutation.mutateAsync({
          linkId,
          assessmentAnswers: validAnswers
        });
      }
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
        <div className="max-w-md w-full mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Assessment Link Invalid</CardTitle>
              <p className="text-muted-foreground mt-2">
                {validityError ? "This assessment link has expired or is no longer valid." : "Unable to access this assessment."}
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="flex justify-center">
                <Button 
                  onClick={() => router.push('/')} 
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Submission result screen (only for POST assessments - PRE assessments are not graded)
  if (submittedResult && assessmentLink?.linkType === "POST_ASSESSMENT") {
    const isPassed = submittedResult.hasPassed === true;
    const isFailed = submittedResult.hasPassed === false;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className={clsx(
                "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                isPassed && "bg-green-100",
                isFailed && "bg-red-100",
                !isPassed && !isFailed && "bg-blue-100"
              )}>
                <span className="text-3xl">
                  {isPassed ? "✅" : isFailed ? "❌" : "📊"}
                </span>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">Assessment Completed!</CardTitle>
              <p className="text-muted-foreground mt-2">Your results are ready</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              {/* Score Display */}
              <div className="bg-muted p-6 rounded-lg border text-center">
                <h3 className="font-semibold text-lg mb-4 text-foreground">Your Score</h3>
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <p className="text-4xl font-bold text-primary">{submittedResult.score?.toFixed(1) || 0}</p>
                    <p className="text-sm text-muted-foreground">out of {submittedResult.maxScore?.toFixed(1) || 0}</p>
                  </div>
                  <div className="h-16 w-px bg-border"></div>
                  <div>
                    <p className="text-4xl font-bold text-primary">{submittedResult.percentage?.toFixed(1) || 0}%</p>
                    <p className="text-sm text-muted-foreground">Percentage</p>
                  </div>
                </div>
              </div>

              {/* Pass/Fail Status */}
              {(isPassed || isFailed) && (
                <div className={clsx(
                  "p-4 rounded-lg border text-center",
                  isPassed && "bg-green-50 border-green-200",
                  isFailed && "bg-red-50 border-red-200"
                )}>
                  <p className={clsx(
                    "font-semibold text-lg",
                    isPassed && "text-green-800",
                    isFailed && "text-red-800"
                  )}>
                    {isPassed ? "🎉 Congratulations! You Passed!" : "📚 Keep Practicing"}
                  </p>
                </div>
              )}

              {/* Best Score Info */}
              {bestScore !== null && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 text-center">
                    <span className="font-semibold">Your Best Score:</span> {bestScore.toFixed(1)}%
                    {submittedResult.percentage !== null && submittedResult.percentage > bestScore && (
                      <span className="ml-2 text-green-700 font-semibold">🎯 New Best!</span>
                    )}
                  </p>
                  <p className="text-xs text-blue-600 text-center mt-1">
                    Your highest score from all attempts will be used
                  </p>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => router.push('/')}
                  size="lg"
                  className="px-12 py-3"
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // PRE assessment completion (no grading, just redirect)
  if (submittedResult && assessmentLink?.linkType === "PRE_ASSESSMENT") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Assessment Submitted!</CardTitle>
              <p className="text-muted-foreground mt-2">Thank you for completing this assessment</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="text-center text-muted-foreground text-sm">
                Your responses have been recorded successfully.
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => router.push('/')}
                  size="lg"
                  className="px-12 py-3"
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pre-assessment screen
  if (!isStarted) {
    const isPostAssessment = assessmentLink?.linkType === "POST_ASSESSMENT";

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
              {/* Best Score Banner for POST Assessment */}
              {isPostAssessment && bestScore !== null && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">Your Best Score: {bestScore.toFixed(1)}%</p>
                      <p className="text-xs text-blue-700 mt-1">
                        📌 Note: Your highest score from all attempts will be counted as your final grade
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                      <span className="text-sm font-bold text-muted-foreground">{totalQuestions}</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Questions</p>
                      <p className="font-medium text-foreground">{totalQuestions} Total</p>
                    </div>
                  </div>
                  {/* Max Attempts - Only show for POST assessments */}
                  {isPostAssessment && (
                    <div className="bg-card p-3 rounded-md flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground">🔄</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Max Attempts</p>
                        <p className="font-medium text-foreground">{assessment?.maxAttempts || 1}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-accent p-5 rounded-lg border">
                <h4 className="font-semibold text-base text-foreground mb-3 text-center">📋 Instructions</h4>
                <ul className="text-muted-foreground text-sm space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Your answers will be automatically saved as you progress</span>
                  </li>
                  {assessment?.timed && (
                    <li className="flex items-start gap-2.5">
                      <span className="text-primary mt-0.5">•</span>
                      <span>The timer will start once you begin</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Navigate using the sidebar or navigation buttons</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Submit when you&apos;re ready to finish</span>
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
                  {startAssessmentMutation.isPending ? "Loading..." : "Start Assessment"}
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
                  Time has expired for this assessment. 
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
      {/* Header - Mobile Responsive */}
      <div className="bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Top Row: Exit button, Title, and Timer (mobile: stacked) */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            {/* Left: Exit + Title */}
            <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/')}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-foreground line-clamp-2">{assessment?.name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{assessmentLink?.traineeName}</p>
              </div>
            </div>
            
            {/* Right: Timer and Progress (mobile: row below, desktop: side by side) */}
            <div className="flex flex-row sm:flex-row items-center gap-3 sm:gap-4 flex-shrink-0">
              {assessment?.timed && timeRemaining !== null && (
                <div className="flex-shrink-0">
                  <Timer timeRemaining={timeRemaining} />
                </div>
              )}
              <div className="text-center sm:text-right bg-muted px-3 sm:px-4 py-2 rounded-lg border flex-shrink-0">
                <p className="text-xs sm:text-sm font-medium text-foreground">Progress</p>
                <p className="text-base sm:text-lg font-bold text-primary/70">{answeredQuestions}/{totalQuestions}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">questions answered</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="font-medium text-foreground">Overall Progress</span>
              <span className="font-bold text-primary/70">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 sm:h-3 [&>div]:bg-primary/60" />
          </div>
        </div>
      </div>

      {/* Banner: Please finish all questions - Clean & Compact */}
      {!allQuestionsAnswered && (
        <div className="px-1">

        <div className=" max-w-7xl mx-auto">
          <div className=" mx-auto px-4 py-2.5">
            <div className="flex items-center justify-center gap-2.5">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5  rounded-full shadow-sm border border-amber-200/40">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-amber-900 font-medium text-xs sm:text-sm">
                  {totalQuestions - answeredQuestions} question{totalQuestions - answeredQuestions !== 1 ? 's' : ''} left
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Assessment Navigation Sidebar - Hidden on mobile, collapsible */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card rounded-lg border shadow-sm sticky top-6">
              <div className="p-3 sm:p-4 border-b">
                <h3 className="font-semibold text-sm sm:text-base text-foreground">Assessment Structure</h3>
              </div>
              
              <div className="p-3 sm:p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
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

          {/* Main Question Area - Mobile Responsive */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {currentSection && currentQuestion && (
              <>
                {/* Section Info - Exam Paper Style - Mobile Responsive */}
                <div className="mb-4 sm:mb-6 border-b-2 border-dashed border-muted-foreground/20 pb-3 sm:pb-4">
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-l-4 border-primary/20 shadow-sm">
                    <div className="text-center mb-2 sm:mb-3">
                      <h1 className="text-lg sm:text-2xl font-bold text-foreground uppercase tracking-wide">
                        SECTION {currentSection.sectionNumber}
                      </h1>
                      <div className="w-12 sm:w-16 h-0.5 bg-primary/40 mx-auto mt-1 rounded"></div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h2 className="text-base sm:text-lg font-semibold text-foreground">
                        {currentSection.title}
                      </h2>
                      
                      {currentSection.description && (
                        <div className="bg-muted/30 p-2 sm:p-3 rounded border-l-2 border-primary/20">
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                            &quot;{currentSection.description}&quot;
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
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

                {/* Navigation - Mobile Responsive */}
                <div className="mt-6 sm:mt-12 mb-4 sm:mb-8">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={(currentSectionIndex === 0 && currentQuestionIndex === 0) || isTimeUp}
                      size="lg"
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 text-sm sm:text-base"
                    >
                      ← Previous
                    </Button>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      {/* Show Next if not last question */}
                      {!(currentSectionIndex === (assessment?.sections.length || 0) - 1 && 
                        currentQuestionIndex === (currentSection?.questions.length || 0) - 1) && (
                        <Button 
                          onClick={handleNext}
                          disabled={isTimeUp}
                          size="lg"
                          className="w-full sm:w-auto px-6 sm:px-8 py-3 text-sm sm:text-base"
                        >
                          Next →
                        </Button>
                      )}
                      
                        {/* Always show submit button */}
                        <Button
                          onClick={handleSubmit}
                          disabled={submitAssessmentMutation.isPending || isTimeUp || !allQuestionsAnswered}
                          variant={allQuestionsAnswered ? "default" : "outline"}
                          size="lg"
                          className="w-full sm:w-auto px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold"
                        >
                          {isTimeUp 
                            ? "Time Expired" 
                            : submitAssessmentMutation.isPending 
                            ? "Submitting..." 
                            : !allQuestionsAnswered
                            ? `Answer All (${totalQuestions - answeredQuestions} left)`
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
