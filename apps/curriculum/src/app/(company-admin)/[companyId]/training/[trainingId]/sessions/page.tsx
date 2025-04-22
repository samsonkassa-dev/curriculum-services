"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button" 
import { Plus } from "lucide-react"
import Link from "next/link"

export default function SessionsPage() {
  const params = useParams()
  const trainingId = params.trainingId as string
  const companyId = params.companyId as string
  
  return (
    <div className="p-6">
      {/* Session listing content goes here */}
      
      {/* Direct link to add session page */}
      <Link href={`/${companyId}/training/${trainingId}/sessions/add`}>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Session
        </Button>
      </Link>
    </div>
  )
} 