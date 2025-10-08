"use client"

import { memo, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tag, Edit2, Trash2, ChevronDown, ChevronRight, Plus, Loader2 } from "lucide-react"
import { Cohort, useDeleteCohort } from "@/lib/hooks/useCohorts"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { DeleteCohortDialog } from "./delete-cohort-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CohortForm } from "./cohort-form"

interface CohortCardProps {
  cohort: Cohort
  onEditCohort?: (cohort: Cohort) => void
  depth?: number
}

function CohortCardComponent({ cohort, onEditCohort, depth = 0 }: CohortCardProps) {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string
  const trainingId = params.trainingId as string
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cohortToDelete, setCohortToDelete] = useState<Cohort | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [isAddSubOpen, setIsAddSubOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  
  const { isProjectManager, isTrainingAdmin } = useUserRole()
  const { deleteCohort, isLoading: isDeleting } = useDeleteCohort()

  const handleViewDetails = () => {
    setIsNavigating(true)
    router.push(`/${companyId}/training/${trainingId}/cohorts/${cohort.id}?depth=${depth}`)
  }

  const handleDeleteCohort = useCallback(() => {
    setCohortToDelete(cohort)
    setDeleteDialogOpen(true)
  }, [cohort])

  const handleEditCohort = useCallback(() => {
    if (onEditCohort) {
      onEditCohort(cohort)
    }
  }, [cohort, onEditCohort])

  const confirmDelete = useCallback(() => {
    if (cohortToDelete) {
      deleteCohort({
        cohortId: cohortToDelete.id,
        trainingId
      })
      setDeleteDialogOpen(false)
      setCohortToDelete(null)
    }
  }, [cohortToDelete, deleteCohort, trainingId])

  // Check if user can edit/delete cohorts (only project manager and training admin)
  const canEditCohorts = isProjectManager || isTrainingAdmin
  const hasChildren = Array.isArray(cohort.subCohorts) && cohort.subCohorts.length > 0
  const isLeaf = !hasChildren
  const isActionable = isLeaf // Only leaf cohorts have sessions and students
  const showAddSub = true // All cohorts can have sub-cohorts added

  return (
    <div className="bg-[#FBFBFB] p-5 rounded-lg border-[0.1px] border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-6 items-start gap-4">
        <div className="flex items-start gap-2 md:col-span-2 col-span-1 min-w-0">
          {hasChildren ? (
            <button
              className="mt-0.5 text-gray-500 hover:text-gray-700 flex-shrink-0"
              onClick={() => setExpanded(v => !v)}
              aria-label={expanded ? "Collapse" : "Expand"}
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-4 h-4 mt-0.5 flex-shrink-0" /> // Spacer for alignment
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[#525252] font-bold text-sm break-words">{cohort.name}</h3>
              {isLeaf && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">
                  Leaf
                </span>
              )}
            </div>
            {cohort.description && (
              <p className="text-[#667085] text-xs line-clamp-2">{cohort.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 md:col-span-1 col-span-1 min-w-0">
          <span className="text-[#525252] font-bold text-xs">Training</span>
          <span className="text-[#555252] font-light text-sm break-words">
            {cohort.trainingTitle}
          </span>
        </div>

        <div className="flex flex-col gap-1 md:col-span-1 col-span-1 min-w-0">
          <span className="text-[#525252] font-bold text-xs">Parent Cohort</span>
          <span className="text-[#555252] font-light text-sm">
            {cohort.parentCohortName || "Main Cohort"}
          </span>
        </div>

        <div className="flex flex-col gap-1 md:col-span-1 col-span-1 min-w-0">
          <span className="text-[#525252] font-bold text-xs">Tags</span>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-1">
              {cohort.tags && cohort.tags.length > 0 ? (
                cohort.tags.slice(0, 2).map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 bg-[#ECF4FF] text-[#0B75FF] px-2 py-0.5 rounded-full">
                    <Tag className="h-2 w-2 flex-shrink-0" />
                    <span className="text-xs font-medium break-words">{tag}</span>
                  </div>
                ))
              ) : (
                <span className="text-[#667085] text-xs italic">No tags</span>
              )}
            </div>
            {cohort.tags && cohort.tags.length > 2 && (
              <span className="text-[#667085] text-xs">+{cohort.tags.length - 2} more</span>
            )}
          </div>
        </div>

        <div className="flex items-center md:justify-end justify-start gap-2 md:col-span-1 col-span-1 flex-wrap">
          {isActionable && (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full border-[#667085] text-[#667085] hover:bg-gray-50 text-xs font-medium"
              onClick={handleViewDetails}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading...
                </>
              ) : (
                "View Details"
              )}
            </Button>
          )}
          {canEditCohorts && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#0B75FF] text-[#0B75FF] hover:bg-[#0B75FF]/10 text-xs font-medium"
                onClick={() => setIsAddSubOpen(true)}
                disabled={isDeleting}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Sub-Cohort
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#667085] text-[#667085] text-xs font-medium"
                onClick={handleEditCohort}
                disabled={isDeleting}
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-red-300 text-red-600 hover:bg-red-50 text-xs font-medium"
                onClick={handleDeleteCohort}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete Cohort Dialog */}
      <DeleteCohortDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cohort={cohortToDelete}
        onConfirmDelete={confirmDelete}
        isDeleting={isDeleting}
      />

      {/* Add Sub-Cohort Modal */}
      <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold">Add Sub-Cohort</DialogTitle>
          </DialogHeader>
          <CohortForm
            trainingId={trainingId}
            companyId={companyId}
            parentCohortId={cohort.id}
            onSuccess={() => setIsAddSubOpen(false)}
            onCancel={() => setIsAddSubOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Children - render all sub-cohorts (sisters) */}
      {hasChildren && expanded && (
        <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
          {cohort.subCohorts!.map((child) => (
            <CohortCard key={child.id} cohort={child} onEditCohort={onEditCohort} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
export const CohortCard = memo(CohortCardComponent) 