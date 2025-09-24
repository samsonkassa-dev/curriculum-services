"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface AssessmentResult {
  id: string;
  assessment: {
    id: string;
    name: string;
    type: string;
    description: string;
    duration: number;
    sections: Array<{
      id: string;
      title: string;
      description: string;
      sectionNumber: number;
      questions: Array<{
        id: string;
        question: string;
        questionType: string;
        questionImageUrl: string | null;
        choices: Array<{
          id: string;
          choiceText: string;
          choiceImageUrl: string | null;
          isCorrect: boolean | null;
        }>;
        weight: number;
      }>;
    }>;
  };
  traineeId: string;
  traineeName: string;
  attemptType: "PRE_ASSESSMENT" | "POST_ASSESSMENT";
  attemptNumber: number;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  attemptStatus: "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";
  assessmentAnswers: Array<{
    id: string;
    assessmentEntryId: string;
    selectedChoiceIds: string[];
    textAnswer: string | null;
  }>;
}

export default function PMAssessmentResultsPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const traineeId = params.traineeId as string;

  const { data: assessmentResult, isLoading, error } = useQuery({
    queryKey: ["assessment", "pm-results", linkId, traineeId],
    queryFn: async () => {
      const response = await api.get(`/assessment/answers/${linkId}/${traineeId}`);
      return response.data as AssessmentResult;
    },
    enabled: !!linkId && !!traineeId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (error || !assessmentResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <XCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Results Not Found</h2>
            <p className="text-gray-600 mb-4">
              Unable to load assessment results for this trainee.
            </p>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { assessment, traineeName, attemptStatus, score, maxScore, percentage, startedAt, submittedAt, assessmentAnswers } = assessmentResult;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAnswerForQuestion = (questionId: string) => {
    return assessmentAnswers.find(answer => answer.assessmentEntryId === questionId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED": return "text-green-600";
      case "IN_PROGRESS": return "text-blue-600";
      case "EXPIRED": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUBMITTED": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "IN_PROGRESS": return <Clock className="h-5 w-5 text-blue-600" />;
      case "EXPIRED": return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Assessment Results</h1>
              <p className="text-sm text-gray-500">{assessment.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {traineeName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className={`flex items-center gap-2 ${getStatusColor(attemptStatus)}`}>
                  {getStatusIcon(attemptStatus)}
                  <span className="font-medium">{attemptStatus.replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Score</p>
                <p className="text-lg font-semibold">
                  {score !== null && maxScore !== null ? `${score}/${maxScore}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Percentage</p>
                <p className="text-lg font-semibold">
                  {percentage !== null ? `${percentage.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-lg font-semibold">
                  {assessment.duration} min
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-500">Started At</p>
                <p>{formatDate(startedAt)}</p>
              </div>
              {submittedAt && (
                <div>
                  <p className="font-medium text-gray-500">Submitted At</p>
                  <p>{formatDate(submittedAt)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions and Answers */}
        <div className="space-y-6">
          {assessment.sections.map((section, sectionIndex) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Section {section.sectionNumber}: {section.title}
                </CardTitle>
                {section.description && (
                  <p className="text-sm text-gray-600">{section.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {section.questions.map((question, questionIndex) => {
                  const answer = getAnswerForQuestion(question.id);
                  const questionNumber = (sectionIndex * 10) + questionIndex + 1;
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">
                          {questionNumber}. {question.question}
                        </h4>
                        {question.weight > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {question.weight} pt{question.weight > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {question.questionImageUrl && (
                        <div className="mb-3">
                          <img
                            src={question.questionImageUrl}
                            alt="Question illustration"
                            className="max-w-sm h-auto rounded border"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        {question.questionType === "TEXT" ? (
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm font-medium text-gray-700 mb-1">Answer:</p>
                            <p className="text-sm">{answer?.textAnswer || "No answer provided"}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {question.choices.map((choice) => {
                              const isSelected = answer?.selectedChoiceIds.includes(choice.id) || false;
                              
                              return (
                                <div
                                  key={choice.id}
                                  className={`flex items-start gap-3 p-3 rounded border ${
                                    isSelected 
                                      ? 'border-blue-300 bg-blue-50' 
                                      : 'border-gray-200'
                                  }`}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    {question.questionType === "RADIO" ? (
                                      <div className={`w-4 h-4 rounded-full border-2 ${
                                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                      }`}>
                                        {isSelected && (
                                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className={`w-4 h-4 rounded border-2 ${
                                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                      }`}>
                                        {isSelected && (
                                          <CheckCircle className="w-3 h-3 text-white" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    {choice.choiceImageUrl ? (
                                      <div className="space-y-2">
                                        <img
                                          src={choice.choiceImageUrl}
                                          alt="Choice illustration"
                                          className="max-w-xs h-auto rounded border"
                                        />
                                        {choice.choiceText && (
                                          <p className="text-sm">{choice.choiceText}</p>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-sm">{choice.choiceText}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {!answer?.selectedChoiceIds?.length && (
                              <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
                                No answer provided
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
