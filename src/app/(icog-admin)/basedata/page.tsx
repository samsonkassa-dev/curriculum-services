"use client"

import { useState, useEffect } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { AddDataDialog } from "./add-data-dialog"
import { SidebarTabs } from "./components/sidebar-tabs"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { BaseDataType } from "@/types/base-data"
import { Button } from "@/components/ui/button"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BaseData() {
  const [activeTab, setActiveTab] = useState<BaseDataType>("education-level")
  const [newItemId, setNewItemId] = useState<string | undefined>()
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  
  const { 
    data, 
    isLoading, 
    add: addMutation, 
    update, 
    remove,
    isAddLoading,
  } = useBaseData(activeTab)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const renderMobileHeader = () => {
    if (!isMobile) return null
    
    if (showSidebar) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-white z-[51] flex justify-end items-center p-4 border-b">
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
      <div className="flex items-center gap-2 ">
        <Button 
          variant="ghost"
          className="text-brand flex items-center gap-2 hover:bg-transparent hover:text-brand py-8"
          onClick={() => setShowSidebar(true)}
        >
          <Menu className="h-5 w-5" />
          <span>Base Data&apos;s</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      "md:w-[calc(100%-85px)] lg:pl-[85px] md:pl-[50px] md:mx-auto w-full",
      isMobile ? "block" : "flex min-h-screen"
    )}>
      {renderMobileHeader()}
      
      {(!isMobile || showSidebar) && (
        <div className={cn(
          "bg-white",
          isMobile ? "fixed inset-0 z-50 pt-16 mt-5 px-4 pb-4" : "md:w-[30%] w-full mx-auto p-5"
        )}>
          <SidebarTabs 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              setActiveTab(tab as BaseDataType)
              if (isMobile) setShowSidebar(false)
            }} 
          />
        </div>
      )}

      <div className="flex-1 md:p-10 p-5 overflow-y-auto">
        <div className="flex justify-between items-center md:mb-6 mb-4">
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
