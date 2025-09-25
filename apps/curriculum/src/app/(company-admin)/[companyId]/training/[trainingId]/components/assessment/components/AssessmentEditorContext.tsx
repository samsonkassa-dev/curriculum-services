"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

export type EditorMode = 'assessment' | 'question'
export type QuestionState = 'viewing' | 'editing' | 'creating'

interface AssessmentEditorState {
  // Navigation
  selectedSection: number
  selectedQuestion: number
  editorMode: EditorMode
  questionState: QuestionState
  
  // Actions
  setSelectedSection: (index: number) => void
  setSelectedQuestion: (index: number) => void
  setEditorMode: (mode: EditorMode) => void
  
  // Question state management
  startEditingQuestion: () => void
  startCreatingQuestion: () => void
  stopEditingQuestion: () => void
  
  // Navigation helpers
  navigateToNewQuestion: (sectionIndex: number, questionIndex: number) => void
  navigateToNewSection: (sectionIndex: number) => void
}

const AssessmentEditorContext = createContext<AssessmentEditorState | null>(null)

export function AssessmentEditorProvider({ children }: { children: React.ReactNode }) {
  const [selectedSection, setSelectedSection] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [editorMode, setEditorMode] = useState<EditorMode>('assessment')
  const [questionState, setQuestionState] = useState<QuestionState>('viewing')

  const startEditingQuestion = useCallback(() => {
    setQuestionState('editing')
    setEditorMode('question')
  }, [])

  const startCreatingQuestion = useCallback(() => {
    setQuestionState('creating')
    setEditorMode('question')
  }, [])

  const stopEditingQuestion = useCallback(() => {
    setQuestionState('viewing')
  }, [])

  const navigateToNewQuestion = useCallback((sectionIndex: number, questionIndex: number) => {
    setSelectedSection(sectionIndex)
    setSelectedQuestion(questionIndex)
    setEditorMode('question')
    setQuestionState('creating')
  }, [])

  const navigateToNewSection = useCallback((sectionIndex: number) => {
    setSelectedSection(sectionIndex)
    setSelectedQuestion(0)
    setEditorMode('question')
    setQuestionState('creating')
  }, [])

  const value: AssessmentEditorState = {
    selectedSection,
    selectedQuestion,
    editorMode,
    questionState,
    setSelectedSection,
    setSelectedQuestion,
    setEditorMode,
    startEditingQuestion,
    startCreatingQuestion,
    stopEditingQuestion,
    navigateToNewQuestion,
    navigateToNewSection,
  }

  return (
    <AssessmentEditorContext.Provider value={value}>
      {children}
    </AssessmentEditorContext.Provider>
  )
}

export function useAssessmentEditor() {
  const context = useContext(AssessmentEditorContext)
  if (!context) {
    throw new Error('useAssessmentEditor must be used within an AssessmentEditorProvider')
  }
  return context
}
