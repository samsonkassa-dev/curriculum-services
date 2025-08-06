"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PencilIcon, Plus, FileText, CheckCircle, Square, Grid3X3 } from "lucide-react"
import { SurveyDetail, SurveyEntry, QuestionType } from "@/lib/hooks/useSurvey"

interface ViewSurveyDetailsProps {
  surveyDetail: SurveyDetail
  onBackToList: () => void
  onEditSurvey: (surveyId: string) => void
  onEditSurveyStructure: (surveyId: string, options?: {
    focusSection?: {
      sectionId?: string
      action: 'add-question' | 'add-section'
    }
  }) => void
  onRefreshDetails: () => void
}

export function ViewSurveyDetails({
  surveyDetail,
  onBackToList,
  onEditSurvey,
  onEditSurveyStructure,
  onRefreshDetails
}: ViewSurveyDetailsProps) {
  
  // Question Type Icon Component
  const QuestionTypeIcon = ({ type }: { type: QuestionType }) => {
    switch (type) {
      case 'TEXT':
        return <FileText className="h-4 w-4" />
      case 'RADIO':
        return <CheckCircle className="h-4 w-4" />
      case 'CHECKBOX':
        return <Square className="h-4 w-4" />
      case 'GRID':
        return <Grid3X3 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Question Type Badge
  const QuestionTypeBadge = ({ type }: { type: QuestionType }) => {
    const colors = {
      TEXT: "bg-green-100 text-green-700",
      RADIO: "bg-blue-100 text-blue-700", 
      CHECKBOX: "bg-purple-100 text-purple-700",
      GRID: "bg-orange-100 text-orange-700"
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[type]}`}>
        <QuestionTypeIcon type={type} />
        {type}
      </span>
    )
  }

  // Compact Question Preview Component
  const QuestionPreview = ({ question, questionNumber }: { question: SurveyEntry; questionNumber: number }) => {
    const getChoicesPreview = (choices: string[]) => {
      if (choices.length <= 3) {
        return choices.join(", ");
      }
      return `${choices.slice(0, 2).join(", ")} and ${choices.length - 2} more...`;
    };

    const getQuestionDetails = () => {
      switch (question.questionType) {
        case 'TEXT':
          return "Text response";
        case 'RADIO':
          return `Single choice: ${getChoicesPreview(question.choices)}`;
        case 'CHECKBOX':
          return `Multiple choice: ${getChoicesPreview(question.choices)}`;
        case 'GRID':
          return `Grid: ${question.rows.length} rows × ${question.choices.length} columns`;
        default:
          return "Unknown type";
      }
    };

    return (
      <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium shrink-0">
          {questionNumber}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <QuestionTypeBadge type={question.questionType} />
            {question.required && (
              <span className="text-red-500 text-xs font-medium">Required</span>
            )}
          </div>
          <p className="font-medium text-gray-900 text-sm truncate mb-1">
            {question.question}
          </p>
          <p className="text-xs text-gray-500">
            {getQuestionDetails()}
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="px-[7%] py-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{surveyDetail?.name || "Loading..."}</h2>
            {surveyDetail?.type && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {surveyDetail.type}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-3 max-w-2xl">
            {surveyDetail?.description || "Loading..."}
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>{surveyDetail?.sections?.length || 0} sections</span>
            <span>{surveyDetail?.sections?.reduce((total, section) => total + section.questions.length, 0) || 0} questions</span>
            <span>{surveyDetail?.sections?.reduce((total, section) => 
              total + section.questions.filter(q => q.required).length, 0
            ) || 0} required</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => onEditSurvey(surveyDetail.id)}
            size="sm"
            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Survey
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToList}
          >
            Back to List
          </Button>
        </div>
      </div>
      
      {/* Survey Sections and Questions */}
      {surveyDetail?.sections && surveyDetail.sections.length > 0 ? (
        <div className="space-y-4">
          {surveyDetail.sections.map((section, sectionIndex) => {
            let questionCounter = 0;
            // Calculate starting question number for this section
            for (let i = 0; i < sectionIndex; i++) {
              questionCounter += surveyDetail.sections[i].questions.length;
            }
            
            return (
              <Card key={sectionIndex} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Section {sectionIndex + 1}: {section.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    onClick={() => onEditSurveyStructure(surveyDetail.id, {
                      focusSection: {
                        sectionId: section.id,
                        action: 'add-question'
                      }
                    })}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </Button>
                </div>
                
                {section.questions.length > 0 ? (
                  <div className="space-y-2">
                    {section.questions.map((entry, questionIndex) => (
                      <QuestionPreview
                        key={entry.id || questionIndex}
                        question={entry}
                        questionNumber={questionCounter + questionIndex + 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm">No questions in this section yet.</p>
                    <Button
                      onClick={() => onEditSurveyStructure(surveyDetail.id, {
                        focusSection: {
                          sectionId: section.id,
                          action: 'add-question'
                        }
                      })}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Add First Question
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-6">
          <div className="text-center py-8 text-gray-500">
            <h3 className="text-lg font-medium mb-2">No Sections Found</h3>
            <p className="mb-4">This survey doesn&apos;t have any sections yet.</p>
            <Button
              onClick={() => onEditSurveyStructure(surveyDetail.id, {
                focusSection: {
                  action: 'add-section'
                }
              })}
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Section
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
} 