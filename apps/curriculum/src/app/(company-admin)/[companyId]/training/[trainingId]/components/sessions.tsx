"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { Plus, Search, Filter } from "lucide-react"
import { useSessions } from "@/lib/hooks/useSession"
import { Input } from "@/components/ui/input"
import { SessionList } from "./sessions/session-list"

interface SessionsComponentProps {
  trainingId: string
}

export function SessionsComponent({ trainingId }: SessionsComponentProps) {
  const router = useRouter()
  const params = useParams()
  const { isProjectManager, isTrainingAdmin } = useUserRole()
  
  const { data, isLoading, error } = useSessions({
    trainingIds: [trainingId],
    pageSize: 20,
    page: 0
  })
  
  const sessions = data?.sessions || []

  const [searchTerm, setSearchTerm] = useState("")

  const handleAddSession = () => {
    router.push(`/${params.companyId}/training/${trainingId}/sessions/add`)
  }

  const filteredSessions = sessions.filter(session => 
    session.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <Loading />
  }

  // Header section with title, search, filters and add button - consistent across all states
  const headerSection = (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-xl font-semibold">Sessions</h1>
      <div className="flex items-center gap-4">
        <div className="relative w-full md:w-auto min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search sessions..."
            className="pl-9 h-10 border border-[#D0D5DD] rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-[#344054] h-10 whitespace-nowrap">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
        {(isProjectManager || isTrainingAdmin) && (
          <Button 
            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 h-10"
            onClick={handleAddSession}
          >
            <Plus className="h-4 w-4" />
            <span>Add Session</span>
          </Button>
        )}
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}

        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">Error Loading Sessions</h3>
          <p className="text-gray-500 text-sm">
            There was a problem loading the sessions. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="px-[7%] py-10">
        {headerSection}

        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Sessions Added Yet</h3>
          <p className="text-gray-500 text-sm">
            Add training sessions to schedule and organize your training program.
          </p>
          {(isProjectManager || isTrainingAdmin) && (
            <Button 
              className="mt-4 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 mx-auto"
              onClick={handleAddSession}
            >
              <Plus className="h-4 w-4" />
              <span>Add Session</span>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="px-[7%] py-10">
      {headerSection}
      <SessionList sessions={filteredSessions} />
    </div>
  )
} 