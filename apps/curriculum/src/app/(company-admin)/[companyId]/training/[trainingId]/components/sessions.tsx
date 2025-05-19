"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { Plus, Filter } from "lucide-react"
import { useSessions } from "@/lib/hooks/useSession"
import { Input } from "@/components/ui/input"
import { SessionList } from "./sessions/session-list"
import Image from "next/image"

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

  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">Sessions</h1>
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
                placeholder="Search sessions..."
                className="pl-10 h-10 text-sm bg-white border-gray-200"
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

        {error ? (
          <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
            <h3 className="text-lg font-medium mb-2">Error Loading Sessions</h3>
            <p className="text-gray-500 text-sm">
              There was a problem loading the sessions. Please try again later.
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border-[0.1px]">
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
        ) : (
          <SessionList sessions={filteredSessions} />
        )}
      </div>
    </div>
  )
} 