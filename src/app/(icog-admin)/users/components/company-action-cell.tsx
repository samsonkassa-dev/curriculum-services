/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import { CompanyUser } from "@/types/users"
import { useRouter } from "next/navigation"

export function CompanyActionCell({ row }: { row: any }) {
  const router = useRouter()
  const item = row.original as CompanyUser

  const handleView = () => {
    router.push(`/users/${item.id}`)
  }

  const handleDelete = async () => {
    // Will implement delete logic
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="ghost" 
        className="h-8 w-8 p-0 text-blue-500"
        onClick={handleView}
      >
        <span className="sr-only">View</span>
        <img src="/eye.svg" alt="View" className="w-5 h-5" />
      </Button>
      {/* <Button 
        variant="ghost" 
        className="h-8 w-8 p-0 text-red-500"
        onClick={handleDelete}
      >
        <span className="sr-only">Delete</span>
        <img src="/deactivate.svg" alt="Delete" className="w-5 h-5" />
      </Button> */}
    </div>
  )
} 