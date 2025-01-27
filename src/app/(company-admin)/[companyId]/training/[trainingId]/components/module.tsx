"use client"

import { useState, useCallback } from "react"
import { useModulesByTrainingId, useCreateModule, useUpdateModule } from "@/lib/hooks/useModule"
import { DefaultCreate } from "./defaultCreate"
import { ModuleAddModal } from "../[moduleId]/components/moduleAddModal"
import { ModuleView } from "../[moduleId]/components/moduleView"
import { Loading } from "@/components/ui/loading"
import { toast } from "sonner"
import { Module, CreateModuleData } from "@/types/module"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ModuleProps {
  trainingId: string
}

export function ModuleComponent({ trainingId }: ModuleProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  
  const { data, isLoading } = useModulesByTrainingId(trainingId)
  const { mutateAsync: createModule, isPending: isCreating } = useCreateModule()
  const { mutateAsync: updateModule, isPending: isUpdating } = useUpdateModule()

  const isEmptyModules = !data?.modules?.length

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setEditingModule(null)
  }, [])

  const handleCreateModule = async (moduleData: { name: string; description: string }) => {
    try {
      if (editingModule) {
        await updateModule({
          moduleId: editingModule.id,
          data: { ...moduleData, trainingId }
        })
      } else {
        await createModule({
          ...moduleData,
          trainingId
        })
      }
      handleCloseModal()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const handleEditClick = useCallback((module: Module) => {
    setEditingModule(module)
    setShowModal(true)
  }, [])

  const handleAddClick = useCallback(() => {
    setEditingModule(null)
    setShowModal(true)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  if (isEmptyModules) {
    return (
      <>
        <div className="w-full mx-auto">
          <div className="mx-[7%] border-2 border-dashed rounded-lg p-4 bg-[#fbfbfb]">
            <div className="flex w-full items-start">
              <Button
                variant="ghost"
                className="text-blue-500 hover:text-blue-600 bg-[#fbfbfb] hover:bg-blue-50/50 flex items-start gap-2"
                onClick={handleAddClick}
              >
                <Image
                  src="/modulePlus.svg"
                  alt="Add Module"
                  width={16}
                  height={20}
                  className="mt-[2px]"
                />
                <span className="font-semibold">Module</span>     
              </Button>
            </div>
          </div>
        </div>
        <ModuleAddModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleCreateModule}
          isLoading={isCreating || isUpdating}
          editData={editingModule}
        />
      </>
    )
  }

  return (
    <div>
      <ModuleView
        modules={data?.modules || []}
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
      />
      <ModuleAddModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateModule}
        isLoading={isCreating || isUpdating}
        editData={editingModule}
      />
    </div>
  )
}
