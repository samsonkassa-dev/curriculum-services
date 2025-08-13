/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, ChevronDown, Trash2 } from "lucide-react"
import { useCohortTrainees, useRemoveTraineesFromCohort } from "@/lib/hooks/useCohorts"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Loading } from "@/components/ui/loading"
import { StudentDataTable } from "../../../components/students/student-data-table"
import { studentColumns, createRemoveFromCohortColumn } from "../../../components/students/student-columns"
import { ColumnDef } from "@tanstack/react-table"
import { useState as useReactState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCohortSurveyLinks } from "@/lib/hooks/useCohortSurveyLinks"
import { Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AddCohortStudentModal } from "./add-cohort-student-modal"
import { Student } from "@/lib/hooks/useStudents"
 
import { toast } from "sonner"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DeleteLinkDialog } from "./DeleteLinkDialog"

interface CohortStudentsProps {
  cohortId: string
  trainingId: string
}

export function CohortStudents({ cohortId, trainingId }: CohortStudentsProps) {
  const params = useParams()
  const companyId = params.companyId as string
  const { isProjectManager, isTrainingAdmin } = useUserRole()
  
  // State for pagination, search, and modal
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  
  // State for remove confirmation dialog
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  // Fetch cohort trainees with pagination
  const { data, isLoading, error, refetch } = useCohortTrainees(cohortId, page, pageSize)
  
  // Remove trainees mutation
  const { removeTrainees, isLoading: isRemoving } = useRemoveTraineesFromCohort()
  
  const students = data?.trainees || []
  const totalPages = data?.totalPages || 0
  const totalElements = data?.totalElements || 0

  // Filter students based on search query (client-side for better UX)
  const filteredStudents = students.filter(student => {
    if (!debouncedSearch) return true
    const searchLower = debouncedSearch.toLowerCase()
    return (
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.contactPhone?.toLowerCase().includes(searchLower)
    )
  })

  const handleOpenAddStudentModal = () => {
    setIsAddStudentModalOpen(true)
  }

  const handleCloseAddStudentModal = () => {
    setIsAddStudentModalOpen(false)
    refetch() // Refresh the cohort students list when modal closes
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }

  const handleRemoveStudent = (student: Student) => {
    if (!student.id) {
      toast.error("Invalid student data")
      return
    }

    // Show confirmation dialog instead of immediately removing
    setStudentToRemove(student)
    setIsRemoveDialogOpen(true)
  }

  const confirmRemoveStudent = () => {
    if (!studentToRemove?.id) {
      toast.error("Invalid student data")
      return
    }

    removeTrainees({
      cohortId,
      traineeIds: [studentToRemove.id],
      trainingId
    }, {
      onSuccess: () => {
        toast.success(`${studentToRemove.firstName} ${studentToRemove.lastName} removed from cohort`)
        refetch() // Refresh the list after removal
        setIsRemoveDialogOpen(false)
        setStudentToRemove(null)
      }
    })
  }

  const cancelRemove = () => {
    setIsRemoveDialogOpen(false)
    setStudentToRemove(null)
  }

  // Get assigned student IDs for the modal (to filter out already assigned students)
  const assignedStudentIds = students.map(student => student.id)

  const traineeIds = filteredStudents.map(s => s.id).filter(Boolean) as string[]
  const {
    selectedSurveyId,
    setSelectedSurveyId,
    viewMode,
    setViewMode,
    expiryValue,
    setExpiryValue,
    expiryUnit,
    setExpiryUnit,
    surveys,
    answeredIds,
    traineeIdToMeta,
    linksLoading,
    refetchAnswered,
    refetchLinks,
    generateForCohort,
    generateForTrainee,
    extendLink,
    deleteLink,
    getAnswersLink,
  } = useCohortSurveyLinks(trainingId, traineeIds)

  // Extend modal state
  const [extendOpen, setExtendOpen] = useReactState(false)
  const [extendByValue, setExtendByValue] = useReactState<number>(1)
  const [extendByUnit, setExtendByUnit] = useReactState<"minutes" | "hours" | "days" | "weeks">("days")
  const [extendingLinkId, setExtendingLinkId] = useReactState<string>("")
  const [extendContext, setExtendContext] = useReactState<{ linkId: string; traineeName?: string; currentExpiry?: string } | null>(null)
  // Delete link dialog state
  const [linkToDelete, setLinkToDelete] = useReactState<{ linkId: string; traineeName?: string } | null>(null)
  const [isDeleteLinkDialogOpen, setIsDeleteLinkDialogOpen] = useReactState(false)

  // Bulk extend modal state
  const [bulkExtendOpen, setBulkExtendOpen] = useReactState(false)
  const [bulkExtendValue, setBulkExtendValue] = useReactState<number>(1)
  const [bulkExtendUnit, setBulkExtendUnit] = useReactState<"minutes" | "hours" | "days" | "weeks">("days")
  const [isBulkExtending, setIsBulkExtending] = useReactState(false)

  // Toggle for survey tools panel
  const [showSurveyTools, setShowSurveyTools] = useReactState(false)

  // Columns: extend with "Survey Link" column
  const formatRemaining = (expiry?: string): string => {
    if (!expiry) return "";
    const expiryMs = new Date(expiry).getTime();
    const now = Date.now();
    const diff = Math.max(0, expiryMs - now);
    const minutes = Math.floor(diff / (60 * 1000));
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  const linkColumn: ColumnDef<Student> = {
    id: "surveyLink",
    header: "Survey Link",
    cell: ({ row }) => {
      const student = row.original
      const isAnswersMode = viewMode === 'answered' && Boolean(selectedSurveyId)
      const meta = student.id ? traineeIdToMeta[student.id] : undefined
      const link = isAnswersMode ? getAnswersLink(selectedSurveyId, student.id) : meta?.fullLink
      const linkId = isAnswersMode ? "" : (meta?.linkId || "")
      const remaining = isAnswersMode ? "" : formatRemaining(meta?.expiryDate)
      const copy = async () => {
        if (link) {
          try {
            await navigator.clipboard.writeText(link)
            toast.success("Link copied")
          } catch {
            toast.error("Failed to copy")
          }
        }
      }
      return (
        <div className="flex items-center gap-2">
          {(!isAnswersMode && linksLoading) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : link ? (
            <>
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate max-w-[180px] inline-block" title={link}
                 onClick={(e) => {
                   // If answers mode, open in a popup so we can receive postMessage on submit
                   if (isAnswersMode) {
                     e.preventDefault()
                     try { window.open(link, '_blank', 'noopener,noreferrer,width=1200,height=800') } catch {}
                   }
                 }}
              >
                {link}
              </a>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={copy} title="Copy link">
                <Copy className="h-4 w-4" />
              </Button>
              {!!linkId && !isAnswersMode && (
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    title="Extend expiry"
                    onClick={() => {
                      setExtendContext({ linkId, traineeName: `${student.firstName} ${student.lastName}`.trim(), currentExpiry: meta?.expiryDate })
                      setExtendOpen(true)
                    }}
                  >
                    {extendingLinkId === linkId ? "Extending..." : "Extend"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500"
                    title="Delete link"
                    onClick={() => {
                      setLinkToDelete({ linkId, traineeName: `${student.firstName} ${student.lastName}`.trim() })
                      setIsDeleteLinkDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!!remaining && !isAnswersMode && <span className="text-xs text-gray-500">Expires in {remaining}</span>}
            </>
          ) : (
            <>
              <span className="text-gray-400">No link</span>
              {!isAnswersMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  disabled={!selectedSurveyId}
                  onClick={() => {
                    if (!student.id || !selectedSurveyId) return
                    generateForTrainee(student.id)
                  }}
                >
                  Generate
                </Button>
              )}
            </>
          )}
        </div>
      )
    }
  }

  // Listen for survey-answered postMessage to refresh links/answered list without polling
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const d = event.data as { type?: string; surveyId?: string; traineeId?: string }
      if (d?.type === 'survey-answered') {
        refetch()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [refetch])

  const columnsWithRemove = [
    ...studentColumns,
    linkColumn,
    createRemoveFromCohortColumn(
      handleRemoveStudent,
      isProjectManager || isTrainingAdmin,
      isRemoving
    )
  ]

  if (isLoading && !data) {
    return <Loading />
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Students</h2>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          <Button
            variant="outline"
            size="sm"
            className="ml-2 h-8"
            onClick={() => setShowSurveyTools((v)=>!v)}
            title="Show survey link tools"
          >
            <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showSurveyTools ? "rotate-180" : "rotate-0"}`} />
            <span className="hidden sm:inline">Survey link tools</span>
            <span className="sm:hidden">Survey tools</span>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative md:w-[300px]">
            <Image
              src="/search.svg"
              alt="Search"
              width={19}
              height={19}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5 z-10"
            />
            <Input
              type="text"
              placeholder="Search students..."
              className="pl-10 h-10 text-sm bg-white border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {(isProjectManager || isTrainingAdmin) && (
            <Button
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 h-10"
              onClick={handleOpenAddStudentModal}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              <span>Add Students</span>
            </Button>
          )}
        </div>
      </div>

      {showSurveyTools && (
        <div className="mb-4 rounded-md border border-gray-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
              <SelectTrigger className="w-[220px] h-10">
                <SelectValue placeholder="Select survey" />
              </SelectTrigger>
              <SelectContent>
                {surveys.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={viewMode}
              onValueChange={(v)=> {
                setViewMode(v as any)
                // Proactively refetch when switching mode
                if (v === 'answered') {
                  refetchAnswered()
                } else {
                  refetchLinks()
                }
              }}
              disabled={!selectedSurveyId}
            >
              <SelectTrigger className="w-[200px] h-10">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Manage links</SelectItem>
                <SelectItem value="answered">View answers</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="number"
              min={1}
              value={expiryValue}
              onChange={(e)=> setExpiryValue(Number(e.target.value))}
              className="w-24 h-10 border rounded px-2 text-sm"
              placeholder="Expiry"
              title="Expiry value"
            />
            <Select value={expiryUnit} onValueChange={(v)=> setExpiryUnit(v as any)}>
              <SelectTrigger className="w-[120px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
              </SelectContent>
            </Select>
            {viewMode === 'all' && (
              <>
                <Button
                  className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white h-10"
                  disabled={!selectedSurveyId}
                  onClick={() => generateForCohort(cohortId)}
                >
                  Generate for Cohort
                </Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-600/90 text-white h-10"
                  disabled={!selectedSurveyId || !(Object.keys(traineeIdToMeta).length) || isBulkExtending}
                  onClick={() => setBulkExtendOpen(true)}
                >
                  {isBulkExtending ? "Extending..." : `Extend all (${Object.keys(traineeIdToMeta).length || 0})`}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {error ? (
        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">Error Loading Students</h3>
          <p className="text-gray-500 text-sm">
            There was a problem loading the students. Please try again later.
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Students Added Yet</h3>
          <p className="text-gray-500 text-sm">
            Add students to this cohort to get started.
          </p>
          {(isProjectManager || isTrainingAdmin) && (
            <Button 
              className="mt-4 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 mx-auto"
              onClick={handleOpenAddStudentModal}
            >
              <Plus className="h-4 w-4" />
              <span>Add Students</span>
            </Button>
          )}
        </div>
      ) : (
        <StudentDataTable
          columns={columnsWithRemove}
          data={viewMode === 'answered' && selectedSurveyId ? filteredStudents.filter(s => s.id && answeredIds.has(s.id)) : filteredStudents}
          isLoading={isLoading}
          pagination={{
            totalPages,
            currentPage: page,
            setPage,
            pageSize,
            setPageSize: handlePageSizeChange,
            totalElements,
          }}
        />
      )}

      {/* Add Student Modal */}
      <AddCohortStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={handleCloseAddStudentModal}
        cohortId={cohortId}
        trainingId={trainingId}
        companyId={companyId}
        assignedStudentIds={assignedStudentIds}
      />

      {/* Remove Student Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="">Remove Student from Cohort</AlertDialogTitle>
            <AlertDialogDescription className="text-black">
              Are you sure you want to remove <strong>{studentToRemove?.firstName} {studentToRemove?.lastName}</strong> from this cohort?
              <br />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemove}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveStudent}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Extend Link Modal */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Extend link {extendContext?.traineeName ? `for ${extendContext.traineeName}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {extendContext?.currentExpiry && (
              <div className="text-sm text-gray-600">Current expiry: {new Date(extendContext.currentExpiry).toLocaleString()} ({formatRemaining(extendContext.currentExpiry)} remaining)</div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm">Extend by</span>
              <input
                type="number"
                min={1}
                value={extendByValue}
                onChange={(e)=> setExtendByValue(Number(e.target.value))}
                className="w-24 h-9 border rounded px-2 text-sm"
              />
              <Select value={extendByUnit} onValueChange={(v)=> setExtendByUnit(v as any)}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={()=> setExtendOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
              disabled={!extendContext?.linkId}
              onClick={() => {
                if (!extendContext?.linkId) return
                setExtendingLinkId(extendContext.linkId)
                try {
                  extendLink({ linkId: extendContext.linkId, byValue: extendByValue, byUnit: extendByUnit })
                  setExtendOpen(false)
                } finally {
                  setExtendingLinkId("")
                }
              }}
            >
              {extendingLinkId ? "Extending..." : "Extend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Extend Modal */}
      <Dialog open={bulkExtendOpen} onOpenChange={setBulkExtendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Extend all links</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">{Object.keys(traineeIdToMeta).length || 0} links will be extended.</div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Extend by</span>
              <input
                type="number"
                min={1}
                value={bulkExtendValue}
                onChange={(e)=> setBulkExtendValue(Number(e.target.value))}
                className="w-24 h-9 border rounded px-2 text-sm"
              />
              <Select value={bulkExtendUnit} onValueChange={(v)=> setBulkExtendUnit(v as any)}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setBulkExtendOpen(false)}>Cancel</Button>
            <Button
              className="bg-amber-600 hover:bg-amber-600/90 text-white"
              disabled={!selectedSurveyId || !(Object.keys(traineeIdToMeta).length) || isBulkExtending}
              onClick={async () => {
                const ids = Object.values(traineeIdToMeta).map(m => m.linkId).filter(Boolean)
                setIsBulkExtending(true)
                try {
                  ids.forEach(id => extendLink({ linkId: id, byValue: bulkExtendValue, byUnit: bulkExtendUnit }))
                  setBulkExtendOpen(false)
                } finally {
                  setIsBulkExtending(false)
                }
              }}
            >
              {isBulkExtending ? "Extending..." : "Extend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteLinkDialog
        isOpen={isDeleteLinkDialogOpen}
        traineeName={linkToDelete?.traineeName}
        isDeleting={false}
        onCancel={() => setIsDeleteLinkDialogOpen(false)}
        onConfirm={() => {
          if (!linkToDelete?.linkId) return
          deleteLink(linkToDelete.linkId)
          setIsDeleteLinkDialogOpen(false)
          setLinkToDelete(null)
        }}
      />
    </div>
  )
} 