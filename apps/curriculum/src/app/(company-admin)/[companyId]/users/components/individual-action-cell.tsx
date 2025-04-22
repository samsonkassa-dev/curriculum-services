/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

// import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IndividualUser } from "@/types/users"

export function IndividualActionCell({ row }: { row: any }) {
  const item = row.original as IndividualUser
  
  const handleToggleStatus = async () => {
    // Will implement status toggle logic
  }

  return (
    <Button 
      variant="ghost" 
      className="h-8 w-8 p-0 text-red-500"
      onClick={handleToggleStatus}
    >
      <span className="sr-only">Toggle Status</span>
      <img src="/deactivate.svg" alt="Delete" className="w-5 h-5" />
    </Button>
  )
} 