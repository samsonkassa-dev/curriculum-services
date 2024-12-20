"use client"

import { useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { AddDataDialog } from "./add-data-dialog"
import { SidebarTabs } from "./components/sidebar-tabs"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { BaseDataType } from "@/types/base-data"

export default function BaseData() {
  const [activeTab, setActiveTab] = useState<BaseDataType>("education-level")
  const [newItemId, setNewItemId] = useState<string | undefined>()
  const { 
    data, 
    isLoading, 
    add: addMutation, 
    update, 
    remove,
    isAddLoading,
  } = useBaseData(activeTab)

  const handleAddData = (newData: { name: string; description: string }) => {
    addMutation.mutate(newData, {
      onSuccess: (response) => {
        if (response?.id) {
          setNewItemId(response.id);
          setTimeout(() => setNewItemId(undefined), 2000);
        }
      }
    });
  }

  const handleUpdateData = (id: string, data: { name: string; description: string }) => {
    update({ id, data });
  }

  const handleDeleteData = (id: string) => {
    remove(id);
  }

  return (
    <div className="flex min-h-screen max-w-[1200px] mx-auto">
      <div className="p-8 mb-6">
        <SidebarTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as BaseDataType)} />
      </div>
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold capitalize">{activeTab.replace('-', ' ')}</h1>
          <AddDataDialog 
            onAddData={handleAddData} 
            isLoading={isAddLoading}
          />
        </div>
        <DataTable 
          columns={columns(activeTab)} 
          data={data || []} 
          onUpdate={handleUpdateData}
          onDelete={handleDeleteData}
          isLoading={isLoading}
          newItemId={newItemId}
          activeTab={activeTab}
        />
      </div>
    </div>
  )
}
