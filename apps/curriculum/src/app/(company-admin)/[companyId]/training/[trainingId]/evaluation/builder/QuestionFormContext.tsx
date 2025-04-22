"use client"

import { createContext, useContext, ReactNode, useState } from "react"

interface MonitoringFormEntry {
  outlineGroup: string
  questions: string[]
}

interface QuestionForm {
  formType: "PRE"
  monitoringFormEntries: MonitoringFormEntry[]
}

interface QuestionFormContextType {
  formData: QuestionForm
  addOutlineGroup: (groupName: string) => void
  removeOutlineGroup: (index: number) => void
  addQuestion: (groupIndex: number, question: string) => void
  removeQuestion: (groupIndex: number, questionIndex: number) => void
  updateQuestion: (groupIndex: number, questionIndex: number, newQuestion: string) => void
  updateOutlineGroup: (groupIndex: number, newName: string) => void
  moveQuestion: (fromGroupIndex: number, fromQuestionIndex: number, toGroupIndex: number, toQuestionIndex: number) => void
}

const QuestionFormContext = createContext<QuestionFormContextType | undefined>(undefined)

export function QuestionFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<QuestionForm>({
    formType: "PRE",
    monitoringFormEntries: []
  })

  const addOutlineGroup = (groupName: string) => {
    setFormData(prev => ({
      ...prev,
      monitoringFormEntries: [...prev.monitoringFormEntries, { outlineGroup: groupName, questions: [] }]
    }))
  }

  const removeOutlineGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      monitoringFormEntries: prev.monitoringFormEntries.filter((_, i) => i !== index)
    }))
  }

  const addQuestion = (groupIndex: number, question: string) => {
    setFormData(prev => ({
      ...prev,
      monitoringFormEntries: prev.monitoringFormEntries.map((entry, i) => 
        i === groupIndex 
          ? { ...entry, questions: [...entry.questions, question] }
          : entry
      )
    }))
  }

  const removeQuestion = (groupIndex: number, questionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      monitoringFormEntries: prev.monitoringFormEntries.map((entry, i) => 
        i === groupIndex 
          ? { ...entry, questions: entry.questions.filter((_, qI) => qI !== questionIndex) }
          : entry
      )
    }))
  }

  const updateQuestion = (groupIndex: number, questionIndex: number, newQuestion: string) => {
    setFormData(prev => ({
      ...prev,
      monitoringFormEntries: prev.monitoringFormEntries.map((entry, i) => 
        i === groupIndex 
          ? {
              ...entry,
              questions: entry.questions.map((q, qI) => 
                qI === questionIndex ? newQuestion : q
              )
            }
          : entry
      )
    }))
  }

  const updateOutlineGroup = (groupIndex: number, newName: string) => {
    setFormData(prev => ({
      ...prev,
      monitoringFormEntries: prev.monitoringFormEntries.map((entry, i) => 
        i === groupIndex 
          ? { ...entry, outlineGroup: newName }
          : entry
      )
    }))
  }

  const moveQuestion = (
    fromGroupIndex: number,
    fromQuestionIndex: number,
    toGroupIndex: number,
    toQuestionIndex: number
  ) => {
    setFormData(prev => {
      const newEntries = [...prev.monitoringFormEntries]
      const question = newEntries[fromGroupIndex].questions[fromQuestionIndex]
      
      // Remove from original position
      newEntries[fromGroupIndex].questions = newEntries[fromGroupIndex].questions.filter((_, i) => i !== fromQuestionIndex)
      
      // Add to new position
      newEntries[toGroupIndex].questions.splice(toQuestionIndex, 0, question)
      
      return {
        ...prev,
        monitoringFormEntries: newEntries
      }
    })
  }

  return (
    <QuestionFormContext.Provider value={{
      formData,
      addOutlineGroup,
      removeOutlineGroup,
      addQuestion,
      removeQuestion,
      updateQuestion,
      updateOutlineGroup,
      moveQuestion
    }}>
      {children}
    </QuestionFormContext.Provider>
  )
}

export function useQuestionForm() {
  const context = useContext(QuestionFormContext)
  if (context === undefined) {
    throw new Error("useQuestionForm must be used within a QuestionFormProvider")
  }
  return context
} 