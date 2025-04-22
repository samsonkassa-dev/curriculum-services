"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, GripVertical, Trash2, ArrowLeft, Edit2, Menu, X } from "lucide-react"
import Link from "next/link"
import { QuestionFormProvider, useQuestionForm } from "./QuestionFormContext"
import { OutlineSidebar } from "@/components/ui/outline-sidebar"
import { cn } from "@/lib/utils"
import { useCreateEvaluation } from "@/lib/hooks/useEvaluation"
import { toast } from "sonner"

function QuestionBuilder() {
  const router = useRouter()
  const params = useParams()
  const searchParams = new URLSearchParams(window.location.search)
  const type = searchParams.get('type')?.toLowerCase() || 'pre'
  const evaluationType = type === 'post' ? 'POST' as const : 'PRE' as const
  const { 
    formData, 
    addOutlineGroup, 
    removeOutlineGroup, 
    addQuestion, 
    removeQuestion, 
    updateQuestion,
    updateOutlineGroup 
  } = useQuestionForm()
  
  const createEvaluation = useCreateEvaluation()
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeGroup, setActiveGroup] = useState<number | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<{ groupIndex: number; questionIndex: number; text: string } | null>(null)
  const inputFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingQuestion && inputFormRef.current && !inputFormRef.current.contains(event.target as Node)) {
        if (editingQuestion.questionIndex === formData.monitoringFormEntries[editingQuestion.groupIndex].questions.length) {
          removeQuestion(editingQuestion.groupIndex, editingQuestion.questionIndex)
        }
        setEditingQuestion(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editingQuestion, formData.monitoringFormEntries, removeQuestion])

  const handleAddQuestion = (groupIndex: number) => {
    addQuestion(groupIndex, "")
    setEditingQuestion({ groupIndex, questionIndex: formData.monitoringFormEntries[groupIndex].questions.length, text: "" })
  }

  const handleUpdateQuestion = () => {
    if (editingQuestion && editingQuestion.text.trim()) {
      updateQuestion(editingQuestion.groupIndex, editingQuestion.questionIndex, editingQuestion.text.trim())
      setEditingQuestion(null)
    }
  }

  const handleSubmit = async () => {
    try {
      await createEvaluation.mutateAsync({
        data: {
          formType: evaluationType,
          monitoringFormEntries: formData.monitoringFormEntries
        },
        trainingId: params.trainingId as string
      })
      
      toast.success("Evaluation form created successfully")
      router.push(`/${params.companyId}/training/${params.trainingId}?tab=evaluation`)
    } catch (error) {
      toast.error("Failed to create evaluation form")
      console.error(error)
    }
  }

  const renderMobileHeader = () => {
    if (!isMobile) return null
    
    if (showSidebar) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-white z-[51] flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">Questions</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSidebar(false)}
            className="hover:bg-transparent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost"
          className="text-brand flex items-center gap-2 hover:bg-transparent hover:text-brand p-0"
          onClick={() => setShowSidebar(true)}
        >
          <Menu className="h-5 w-5" />
          <span>Questions</span>
        </Button>
      </div>
    )
  }

  const outlineGroups = [
    {
      title: "",
      items: formData.monitoringFormEntries.map((entry, index) => ({
        label: entry.outlineGroup || `Question Group ${index + 1}`,
        isCompleted: entry.questions.length > 0
      }))
    }
  ]

  const renderContent = () => {
    if (activeGroup === null) {
      return (
        <div className="text-center mt-5 py-5 border border-dashed rounded-md bg-gray-50">
          <p className="text-gray-500">Select a question group or create a new one to start adding questions.</p>
        </div>
      )
    }

    const currentGroup = formData.monitoringFormEntries[activeGroup]
    if (!currentGroup) return null

    return (
      <div className="space-y-4 mt-5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{currentGroup.outlineGroup}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newName = prompt("Enter new group name", currentGroup.outlineGroup)
                if (newName?.trim()) {
                  updateOutlineGroup(activeGroup, newName.trim())
                }
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[#99948E] text-sm">
            Enter questions for this group to evaluate the training.
          </p>
        </div>

        <div className="space-y-4">
          {currentGroup.questions.map((question, questionIndex) => (
            editingQuestion?.groupIndex === activeGroup && editingQuestion?.questionIndex === questionIndex ? (
              <div key={questionIndex} className="relative mb-4" ref={inputFormRef}>
                <div className="mb-2">
                  <h3 className="text-[#31302F] font-semibold">Question No. {questionIndex + 1}</h3>
                </div>
                <Input
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  placeholder="Enter your question"
                  className="w-full pr-9"
                />
                <div className="mt-4">
                  <Button
                    onClick={handleUpdateQuestion}
                    disabled={!editingQuestion.text.trim()}
                    className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div key={questionIndex} className="flex items-start gap-4 p-6 pr-8 pl-2 rounded-lg border border-[#EBEBEB]  shadow-[4px_4px_12px_0px_rgba(228,228,228,0.15),-4px_-4px_12px_0px_rgba(228,228,228,0.15)]">
                <div className="p-2  rounded-[15px]">
                  <GripVertical className="w-5 h-5 text-[#414554]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center gap-[72px]">
                    <p className="text-[18px] leading-[29px] text-[#31302F] font-normal">{question}</p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setEditingQuestion({ groupIndex: activeGroup, questionIndex, text: question })}
                        className="p-2 bg-[#EBF4FF] rounded-[15px] hover:bg-[#EBF4FF]/80"
                        aria-label="Edit question"
                      >
                        <Edit2 className="w-5 h-5 text-[#0B75FF]" />
                      </button>
                      <button
                        onClick={() => removeQuestion(activeGroup, questionIndex)}
                        className="p-2 bg-[#FFF1F1] rounded-[15px] hover:bg-[#FFF1F1]/80"
                        aria-label="Delete question"
                      >
                        <Trash2 className="w-5 h-5 text-[#FF4747]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}

          {editingQuestion?.groupIndex === activeGroup && editingQuestion?.questionIndex === currentGroup.questions.length && (
            <div className="relative mb-4" ref={inputFormRef}>
              <div className="mb-2">
                <h3 className="text-[#31302F] font-semibold">Question No. {currentGroup.questions.length + 1}</h3>
              </div>
              <Input
                value={editingQuestion.text}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                placeholder="Enter your question"
                className="w-full pr-9"
                autoFocus
              />
              <div className="mt-4">
                <Button
                  onClick={handleUpdateQuestion}
                  disabled={!editingQuestion.text.trim()}
                  className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {!editingQuestion && (
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-[#0B75FF] hover:bg-transparent hover:text-[#0B75FF]/90 p-0"
              onClick={() => handleAddQuestion(activeGroup)}
            >
              <div className="p-1 rounded-full">
                <Plus className="w-5 h-5 stroke-[2px]" />
              </div>
              <span className="font-semibold text-base">Add More Question</span>
            </Button>
          )}
        </div>

        <div className="flex justify-between pt-14">
          <Button
            variant="outline"
            className="border-[#9C9791] text-[#9C9791] hover:bg-gray-50"
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Button
            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white px-8"
            disabled={currentGroup.questions.length === 0 || createEvaluation.isPending}
            onClick={handleSubmit}
          >
            {createEvaluation.isPending ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      {/* Breadcrumb Navigation */}
      <div className="px-[7%] pt-7 text-sm flex items-center flex-wrap">
        <Link 
          href={`/${params.companyId}/training/${params.trainingId}?tab=evaluation`} 
          className="text-gray-600 hover:text-brand transition-colors font-medium flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Evaluations
        </Link>
      </div>

      <div className={cn(
        "px-[7%] py-10",
        isMobile ? "block" : "flex gap-8"
      )}>
        {renderMobileHeader()}
        
        {(!isMobile || showSidebar) && (
          <div className={cn(
            "",
            isMobile 
              ? "fixed bg-white inset-0 z-50 pt-16 px-4 pb-4 overflow-y-auto" 
              : "w-[300px] shrink-0"
          )}>
            <div className="space-y-4">
              <OutlineSidebar
                title="Questions"
                groups={outlineGroups}
                activeItem={activeGroup !== null ? formData.monitoringFormEntries[activeGroup]?.outlineGroup : ""}
                onItemClick={(groupName) => {
                  const index = formData.monitoringFormEntries.findIndex(e => e.outlineGroup === groupName)
                  setActiveGroup(index)
                  if (isMobile) setShowSidebar(false)
                }}
              />
              <div className="px-6">
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => {
                    const name = prompt("Enter group name")
                    if (name?.trim()) {
                      addOutlineGroup(name.trim())
                      setActiveGroup(formData.monitoringFormEntries.length)
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Group
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className={cn(
          "flex-1 max-w-3xl",
          isMobile && showSidebar ? "hidden" : "block"
        )}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default function EvaluationBuilderPage() {
  return (
    <QuestionFormProvider>
      <QuestionBuilder />
    </QuestionFormProvider>
  )
} 