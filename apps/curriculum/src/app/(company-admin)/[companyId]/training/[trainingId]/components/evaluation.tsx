"use client"

import { useRouter, useParams } from "next/navigation"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { useGetEvaluations } from "@/lib/hooks/useEvaluation"
import { format } from "date-fns"
import { Eye, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EvaluationComponentProps {
  trainingId: string
}

export function EvaluationComponent({ trainingId }: EvaluationComponentProps) {
  const router = useRouter()
  const params = useParams()
  const { isCompanyAdmin, isProjectManager } = useUserRole()
  const { data, isLoading } = useGetEvaluations(trainingId)

  const handleCreateForm = () => {
    router.push(`/${params.companyId}/training/${trainingId}/evaluation/create`)
  }

  const handleViewForm = (formId: string) => {
    router.push(`/${params.companyId}/training/${trainingId}/evaluation/${formId}`)
  }

  if (isLoading) {
    return <Loading />
  }

  if (!data?.monitoringForm?.length) {
    return (
      <div className="px-[7%] py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold">Evaluation Forms</h1>
          {isProjectManager && (
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              onClick={handleCreateForm}
            >
              <span>+</span>
              <span>Create Form</span>
            </Button>
          )}
        </div>

        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Evaluation Forms Created</h3>
          <p className="text-gray-500 text-sm">
            Create evaluation forms to assess training effectiveness and gather participant feedback.
          </p>
          {isProjectManager && (
            <Button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleCreateForm}
            >
              Create Form
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="px-[7%] py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Evaluation Forms</h1>
        {isProjectManager && (
          <Button 
            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
            onClick={handleCreateForm}
          >
            <span>+</span>
            <span>Create Form</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.monitoringForm.map((form) => (
          <div 
            key={form.id} 
            className="bg-white rounded-lg border border-[#EBEBEB] p-6 space-y-6 relative"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-4 top-1">
                  <MoreVertical className="h-4 w-4 text-brand" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewForm(form.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Form
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Evaluation Form</h3>
              <p className="text-sm text-gray-500">
                Created on {format(new Date(form.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
              <div className="flex items-center gap-2"> 
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  form.formType === 'PRE' 
                    ? 'bg-[#EBF4FF] text-[#0B75FF]'
                    : form.formType === 'MID'
                    ? 'bg-[#e8f5ea] text-[#1c9c15]'
                    : form.formType === 'POST'
                    ? 'bg-[#f9f9db] text-[#959713]' 
                    : 'bg-[#FFF1F1] '
                }`}>
                  {form.formType === 'PRE' 
                    ? 'Pre-Training' 
                    : form.formType === 'MID'
                    ? 'Mid-Training'
                    : form.formType === 'POST' 
                    ? 'Post-Training'
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 