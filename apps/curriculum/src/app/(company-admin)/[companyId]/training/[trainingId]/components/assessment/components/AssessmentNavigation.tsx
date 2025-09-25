"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"

type AssessmentSectionForm = {
  title: string
  description: string
  assessmentEntries: any[]
}

interface AssessmentNavigationProps {
  sections: AssessmentSectionForm[]
  selectedSection: number
  selectedQuestion: number
  editMode: 'assessment' | 'question'
  assessmentName: string
  isEditMode?: boolean
  canAddSection?: boolean
  onSelectAssessmentSettings: () => void
  onSelectQuestion: (sectionIndex: number, questionIndex: number) => void
  onUpdateSectionTitle: (sectionIndex: number, title: string) => void
  onUpdateSectionDescription: (sectionIndex: number, description: string) => void
  onDeleteSection: (sectionIndex: number) => void
  onDeleteQuestion: (sectionIndex: number, questionIndex: number) => void
  onAddQuestion: (sectionIndex: number) => void
  onAddSection?: () => void
}

export function AssessmentNavigation({
  sections,
  selectedSection,
  selectedQuestion,
  editMode,
  assessmentName,
  isEditMode = false,
  canAddSection = true,
  onSelectAssessmentSettings,
  onSelectQuestion,
  onUpdateSectionTitle,
  onUpdateSectionDescription,
  onDeleteSection,
  onDeleteQuestion,
  onAddQuestion,
  onAddSection
}: AssessmentNavigationProps) {

  return (
    <div className="bg-white rounded-lg border shadow-sm sticky top-8">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Assessment Structure</h3>
      </div>
      
      <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Assessment Settings */}
        <div
          className={`p-3 rounded-lg transition-all ${
            isEditMode 
              ? 'bg-gray-100 border border-gray-200 cursor-not-allowed opacity-60' 
              : editMode === 'assessment' 
                ? 'bg-blue-50 border border-blue-200 shadow-sm cursor-pointer' 
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer'
          }`}
          onClick={isEditMode ? undefined : onSelectAssessmentSettings}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-600">⚙️</span>
            <span className="font-medium text-sm">
              Assessment Settings {isEditMode && '(Read-only)'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1 truncate">
            {assessmentName || 'Untitled Assessment'}
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg border border-gray-200">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-green-600 text-lg">📁</span>
                  <div className="flex-1">
                    <div className="space-y-2">
                      <Input
                        value={section.title}
                        onChange={(e) => onUpdateSectionTitle(sectionIndex, e.target.value)}
                        placeholder={`Section ${sectionIndex + 1}`}
                        readOnly={isEditMode}
                        className={`text-sm h-9 border-0 px-3 py-2 font-medium bg-transparent transition-all duration-200 ${
                          isEditMode
                            ? 'cursor-not-allowed opacity-60 bg-gray-50'
                            : 'hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-300 focus:rounded'
                        }`}
                      />
                      <Textarea
                        value={section.description || ""}
                        onChange={(e) => onUpdateSectionDescription(sectionIndex, e.target.value)}
                        placeholder="Section description (optional)"
                        readOnly={isEditMode}
                        className={`text-xs h-16 border-0 px-3 py-2 bg-transparent resize-none transition-all duration-200 ${
                          isEditMode
                            ? 'cursor-not-allowed opacity-60 bg-gray-50'
                            : 'hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-300 focus:rounded'
                        }`}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                {sections.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSection(sectionIndex)}
                    className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-2 space-y-1">
              {section.assessmentEntries.map((entry, questionIndex) => (
                <div
                  key={questionIndex}
                  className={`p-2 rounded cursor-pointer transition-all ${
                    selectedSection === sectionIndex && selectedQuestion === questionIndex && editMode === 'question'
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectQuestion(sectionIndex, questionIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`/question-type-${entry.questionType.toLowerCase()}.svg`}
                        alt={`${entry.questionType} icon`}
                        className="w-4 h-4 text-gray-600"
                        onError={(e) => {
                          // Fallback to generic icon if specific icon doesn't exist
                          e.currentTarget.src = entry.questionType === 'RADIO' ? '/question-type-radio.svg' : '/question-type-checkbox.svg'
                        }}
                      />
                      <span className="text-sm font-medium">Q{questionIndex + 1}</span>
                      <span className="text-[10px] text-gray-500">Weight: {entry.weight}</span>
                    </div>
                    {section.assessmentEntries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteQuestion(sectionIndex, questionIndex)
                        }}
                        className="p-1 h-5 w-5 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {entry.question || 'Untitled question'}
                  </p>
                </div>
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddQuestion(sectionIndex)}
                className="w-full mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-dashed border-blue-300 hover:border-blue-400"
              >
                + Add Question
              </Button>
            </div>
          </div>
        ))}

        {/* Add Section Button (hidden in edit mode if canAddSection is false) */}
        {canAddSection && onAddSection && (
          <Button
            variant="ghost"
            onClick={onAddSection}
            className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 border border-dashed border-green-300 hover:border-green-400"
          >
            + Add Section
          </Button>
        )}
      </div>
    </div>
  )
}
