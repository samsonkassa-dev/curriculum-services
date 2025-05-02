"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateToDisplay, formatTimeToDisplay } from "@/lib/utils"
import { useSession } from "@/lib/hooks/useSession"
import React from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { StudentsTab } from "./components/students-tab";
import { TrainerDetailsTab } from "./components/TrainerDetailsTab";
import PreTrainingAssessment from "./components/pre-training-assessment";


export default function SessionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string
  const trainingId = params.trainingId as string
  const sessionId = params.sessionId as string
  const [activeTab, setActiveTab] = useState("session-details")
  
  const { data: session, isLoading, error } = useSession(sessionId);

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return <Loading />
  }

  if (error || !session) {
    return (
      <div className="px-[7%] py-10">
        <div className="flex items-center gap-2 mb-8">
          <Button 
            onClick={handleBack}
            variant="ghost" 
            className="p-0 hover:bg-transparent"
          >
            <ChevronLeft className="h-5 w-5 text-blue-500" />
          </Button>
          <h1 className="text-xl font-semibold">Session Details</h1>
        </div>

        <div className="text-center py-20 bg-[#fbfbfb] rounded-lg border border-[#EAECF0]">
          <h3 className="text-lg font-medium mb-2">Error Loading Session</h3>
          <p className="text-gray-500 text-sm">
            There was a problem loading the session details. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-[#ECF4FF] text-[#0B75FF]"
    
    switch (status.toUpperCase()) {
      case "SCHEDULED":
        return "bg-[#ECF4FF] text-[#0B75FF]"
      case "IN_PROGRESS":
        return "bg-[#ECFDF3] text-[#037847]"
      case "COMPLETED":
        return "bg-[#ECFDF3] text-[#037847]"
      case "CANCELED":
        return "bg-[#FEF3F2] text-[#D92D20]"
      case "POSTPONED":
        return "bg-[#FFF6ED] text-[#F79009]"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }
  
  const getStatusDotColor = (status: string | undefined) => {
    if (!status) return "bg-[#0B75FF]"
    
    switch (status.toUpperCase()) {
      case "SCHEDULED":
        return "bg-[#0B75FF]"
      case "IN_PROGRESS":
        return "bg-[#037847]"
      case "COMPLETED":
        return "bg-[#037847]"
      case "CANCELED":
        return "bg-[#D92D20]"
      case "POSTPONED":
        return "bg-[#F79009]"
      default:
        return "bg-gray-500"
    }
  }

  const formatStatus = (status: string | undefined): string => {
    if (!status) return "Unknown"
    return status
      .toLowerCase()
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <h3 className="text-sm font-medium mb-2 text-[#292827]">{label}</h3>
      <div className="bg-white border border-[#E4E4E4] p-3 rounded-md min-h-[48px] flex items-center">
        <p className="text-sm text-[#565555] break-words">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="px-[7%] py-10">
      <div className="flex items-center gap-2 mb-8">
        <Button 
          onClick={handleBack}
          variant="ghost" 
          className="p-0 hover:bg-transparent"
        >
          <ChevronLeft className="h-5 w-5 text-blue-500" />
        </Button>
        <h1 className="text-xl font-semibold">Session Details</h1>
      </div>

      <div className="bg-[#FBFBFB] p-5 mb-8 rounded-lg border border-[#EAECF0]">
        <div className="flex flex-wrap justify-between items-center gap-x-10 gap-y-4">
          <div className="flex flex-col gap-1 min-w-[150px]">
            <h3 className="text-[#525252] font-bold text-sm">{session.name || 'Session Name N/A'}</h3>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[#525252] font-bold text-xs">Start Date</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#565555]" />
              <span className="text-[#555252] font-light text-sm">
                {formatDateToDisplay(session.startDate)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[#525252] font-bold text-xs">End Date</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#565555]" />
              <span className="text-[#555252] font-light text-sm">
                {formatDateToDisplay(session.endDate)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[#525252] font-bold text-xs">Status</span>
            <div 
              className={`flex items-center gap-1.5 py-0.5 px-2 rounded-2xl ${getStatusColor(session.status)}`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${getStatusDotColor(session.status)}`}></div>
              <span className="text-xs font-medium">
                {formatStatus(session.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="session-details" className="w-full mb-8" onValueChange={setActiveTab}>
        <TabsList className="bg-transparent px-0 mb-6">
          <TabsTrigger 
            value="session-details"
          >
            Session Details
          </TabsTrigger>
          <TabsTrigger 
            value="students-list"
          >
            Students List
          </TabsTrigger>
          <TabsTrigger 
            value="trainer-details"
          >
            Trainer Details
          </TabsTrigger>
          <TabsTrigger 
            value="assistant-trainer-details"
          >
            Assistant Trainer Details
          </TabsTrigger>

          <TabsTrigger 
            value="pre-training-assessment"
          >
            Pre Training Assessment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="session-details" className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <h3 className="text-sm font-medium mb-2 text-[#292827]">Select Module / Lessons</h3>
              <div className="bg-white border border-[#E4E4E4] p-3 rounded-md min-h-[48px]">
                <div className="flex flex-wrap gap-2">
                  {session.lessons && session.lessons.length > 0 ? (
                    session.lessons.map((lesson) => (
                      <span 
                        key={lesson.id} 
                        className="bg-[rgba(11,117,255,0.1)] text-black px-2 py-1 rounded-full text-xs font-light"
                      >
                        {lesson.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">No lessons assigned</span>
                  )}
                </div>
              </div>
            </div>

            <DetailItem 
              label="Delivery Method" 
              value={session.deliveryMethod === "OFFLINE" ? "Offline" : "Online"}
            />

            <DetailItem 
              label="Number of Students"
              value={session.numberOfStudents ?? 'Not specified'}
            />

            <DetailItem 
              label="Training Venue"
              value={session.trainingVenue ? 
                `${session.trainingVenue.name}, ${session.trainingVenue.location}${session.trainingVenue.city ? `, ${session.trainingVenue.city.name}` : ''}` : 
                'No venue specified'}
            />

            <div className="space-y-1">
              <h3 className="text-sm font-medium mb-2 text-[#292827]">Starts On</h3>
              <div className="flex gap-4 items-center">
                <div className="bg-white border border-[#E4E4E4] p-3 rounded-md flex-1 min-h-[48px] flex items-center">
                  <p className="text-sm text-[#565555]">
                    {formatDateToDisplay(session.startDate)}
                  </p>
                </div>
                <p className="text-sm font-medium text-[#292827]">at</p>
                <div className="bg-white border border-[#E4E4E4] p-3 rounded-md w-32 min-h-[48px] flex items-center">
                  <p className="text-sm text-[#565555]">
                    {formatTimeToDisplay(session.startDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium mb-2 text-[#292827]">Ends On</h3>
              <div className="flex gap-4 items-center">
                <div className="bg-white border border-[#E4E4E4] p-3 rounded-md flex-1 min-h-[48px] flex items-center">
                  <p className="text-sm text-[#565555]">
                    {formatDateToDisplay(session.endDate)}
                  </p>
                </div>
                <p className="text-sm font-medium text-[#292827]">at</p>
                <div className="bg-white border border-[#E4E4E4] p-3 rounded-md w-32 min-h-[48px] flex items-center">
                  <p className="text-sm text-[#565555]">
                    {formatTimeToDisplay(session.endDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-[#292827]">
                  The Training Venue meets the technological and tools requirement?
                </h3>
                {session.meetsRequirement === undefined ? (
                  <p className="text-sm text-gray-500 italic pt-2">Not specified</p>
                ) : (
                  <RadioGroup 
                    defaultValue={session.meetsRequirement ? "yes" : "no"}
                    className="flex items-center space-x-6 pt-2"
                    disabled
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="req-yes" />
                      <Label htmlFor="req-yes" className="text-sm text-[#565555] font-normal cursor-default">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="req-no" />
                      <Label htmlFor="req-no" className="text-sm text-[#565555] font-normal cursor-default">
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              </div>
              {session.meetsRequirement === false && session.requirementRemark && (
                <DetailItem 
                  label="Requirement Remark"
                  value={session.requirementRemark}
                />
              )}
            </div>

            <DetailItem 
              label="Trainer Compensation Type"
              value={session.trainerCompensationType ? 
                session.trainerCompensationType.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ') : 
                'Not specified'}
            />

            <DetailItem 
              label="Amount"
              value={session.trainerCompensationAmount !== undefined ? `${session.trainerCompensationAmount} ETB` : 'Not specified'}
            />
          </div>
        </TabsContent>

        <TabsContent value="students-list">
          {session && (
            <StudentsTab 
              session={session}
              isLoading={isLoading}
              sessionId={sessionId}
              trainingId={trainingId}
              companyId={companyId}
            />
          )}
        </TabsContent>

        <TabsContent value="trainer-details">
          <TrainerDetailsTab sessionId={sessionId} trainerType="MAIN" />
        </TabsContent>

        <TabsContent value="assistant-trainer-details">
          <TrainerDetailsTab sessionId={sessionId} trainerType="ASSISTANT" />
        </TabsContent>
      <TabsContent value="pre-training-assessment">
        <PreTrainingAssessment sessionId={sessionId}/>
      </TabsContent>
      </Tabs>

    </div>
  )
} 