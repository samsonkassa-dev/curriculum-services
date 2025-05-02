import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

import { Module } from "@/types/module"
import { useAddSession } from "@/lib/hooks/useSession"
import { useModulesByTrainingId } from "@/lib/hooks/useModule"
import { useGetLessons } from "@/lib/hooks/useLesson"
import { useTrainingVenues } from "@/lib/hooks/useTrainingVenue"
import { sessionSchema, SessionFormValues, timeOptions, CustomCreateSessionData } from "./session-schema"
import { toast } from "sonner"

// Helper function to format Date to YYYY-MM-DD string
const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return ""
  // Adjust for timezone offset before formatting
  const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return adjustedDate.toISOString().split("T")[0]
}

// Helper function to parse YYYY-MM-DD string to Date (handling potential empty string)
const parseDateFromInput = (dateString: string): Date | null => {
  if (!dateString) return null
  // Parse string assuming local timezone midnight to avoid timezone shifts.
  return new Date(dateString + 'T00:00:00')
}

interface SessionFormProps {
  trainingId: string
  companyId: string
  onSuccess: () => void
  onCancel: () => void
}

// Extended Module type with parent-child relationship as returned by API
interface ModuleWithRelationship extends Module {
  parentModule?: {
    id: string;
    name: string;
    description: string;
  } | null;
}

export function SessionForm({ trainingId, companyId, onSuccess, onCancel }: SessionFormProps) {
  // Fetch required data
  const { addSession, isLoading: isAddingSession } = useAddSession()
  const { data: modulesData, isLoading: isLoadingModules } = useModulesByTrainingId(trainingId, true)
  const { data: venuesData, isLoading: isLoadingVenues } = useTrainingVenues()
  
  // State for selected module to filter lessons
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [selectedSubModuleId, setSelectedSubModuleId] = useState<string | null>(null)

  // Fetch lessons for the selected module or submodule
  const moduleIdToFetch = selectedSubModuleId || selectedModuleId
  const { data: lessonsByModule, isLoading: isLoadingLessons } = useGetLessons(moduleIdToFetch || '')
  
  // Form setup
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      lessonIds: [],
      deliveryMethod: "OFFLINE",
      startDate: new Date(),
      startTime: "9:00 AM",
      endDate: new Date(),
      endTime: "5:00 PM",
      numberOfStudents: 0,
      trainingVenueId: "",
      meetsRequirement: true,
      requirementRemark: "",
      trainerCompensationType: "PER_HOUR",
      trainerCompensationAmount: 0,
      numberOfAssistantTrainer: 0,
      assistantTrainerCompensationAmount: 0,
    },
  })
  
  // Get modules and submodules
  const modules = (modulesData?.modules || []) as ModuleWithRelationship[]
  const mainModules = modules.filter(module => !module.parentModule)
  
  // Get submodules for selected module
  const subModules = selectedModuleId 
    ? modules.filter(module => module.parentModule?.id === selectedModuleId)
    : []
  
  // Handler for form submission
  const onSubmit = (values: SessionFormValues) => {
    // Convert dates and times to ISO format
    const startDateTime = new Date(values.startDate)
    const startTimeParts = values.startTime.match(/(\d+):(\d+)\s?(AM|PM)/)
    if (startTimeParts) {
      let hours = parseInt(startTimeParts[1])
      const minutes = parseInt(startTimeParts[2])
      const period = startTimeParts[3]
      
      if (period === "PM" && hours < 12) hours += 12
      if (period === "AM" && hours === 12) hours = 0
      
      startDateTime.setHours(hours, minutes)
    }
    
    const endDateTime = new Date(values.endDate)
    const endTimeParts = values.endTime.match(/(\d+):(\d+)\s?(AM|PM)/)
    if (endTimeParts) {
      let hours = parseInt(endTimeParts[1])
      const minutes = parseInt(endTimeParts[2])
      const period = endTimeParts[3]
      
      if (period === "PM" && hours < 12) hours += 12
      if (period === "AM" && hours === 12) hours = 0
      
      endDateTime.setHours(hours, minutes)
    }
    
    // Create session data that matches CreateSessionData type
    const sessionData: CustomCreateSessionData = {
      name: values.name,
      lessonIds: values.lessonIds,
      deliveryMethod: values.deliveryMethod,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      startTime: values.startTime,
      endTime: values.endTime,
      numberOfStudents: values.numberOfStudents,
      trainingVenueId: values.trainingVenueId || "", // Provide default empty string
      meetsRequirement: values.meetsRequirement,
      requirementRemark: values.meetsRequirement ? "" : (values.requirementRemark || ""),
      trainerCompensationType: values.trainerCompensationType,
      trainerCompensationAmount: values.trainerCompensationAmount,
      numberOfAssistantTrainer: values.numberOfAssistantTrainer,
      assistantTrainerCompensationType: values.numberOfAssistantTrainer > 0 
        ? (values.assistantTrainerCompensationType || "PER_HOUR") 
        : "PER_HOUR",
      assistantTrainerCompensationAmount: values.numberOfAssistantTrainer > 0 
        ? (values.assistantTrainerCompensationAmount || 0) 
        : 0
    }
    
    // Add training link only for online or self-paced delivery
    if ((values.deliveryMethod === "ONLINE" || values.deliveryMethod === "SELF_PACED") && values.trainingLink) {
      sessionData.trainingLink = values.trainingLink
    }
    
    // Add session
    addSession({ trainingId, sessionData }, {
      onSuccess: () => {
        toast.success("Session added successfully")
        onSuccess()
      },
      onError: (error) => {
        toast.error("Failed to add session")
        console.error(error)
      }
    })
  }
  
  // Watch form values to enable/disable certain fields
  const meetsRequirement = form.watch("meetsRequirement")
  const deliveryMethod = form.watch("deliveryMethod")
  const numberOfAssistantTrainer = form.watch("numberOfAssistantTrainer")
  
  return (
    <div className="relative">
      <ScrollArea className="h-[65vh] md:h-[65vh] pr-4">
        <div className="px-4 py-2 pb-24">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Session Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter session name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Module Selection */}
              <div className="space-y-2">
                <Label>Select Module</Label>
                {isLoadingModules ? (
                  <div className="py-2 px-3 border rounded-md text-sm text-gray-500">Loading modules...</div>
                ) : mainModules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600 mb-1 text-center">
                      No modules available for this training.
                    </p>
                    <p className="text-xs text-gray-500 text-center">
                      You need to create modules and lessons before creating a session.
                    </p>
                  </div>
                ) : (
                  <Select 
                    onValueChange={(value) => {
                      setSelectedModuleId(value)
                      setSelectedSubModuleId(null)
                      form.setValue("lessonIds", [])
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainModules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {/* Submodule Selection (Optional) */}
              {subModules.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Submodule (Optional)</Label>
                  <Select 
                    onValueChange={(value) => {
                      setSelectedSubModuleId(value)
                      form.setValue("lessonIds", [])
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a submodule" />
                    </SelectTrigger>
                    <SelectContent>
                      {subModules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Lesson Selection - Replaced with enhanced checkbox list */}
              <FormField
                control={form.control}
                name="lessonIds"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Select Lessons</FormLabel>
                    <div className="border rounded-md p-3">
                      {!moduleIdToFetch ? (
                        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                          <p className="text-sm text-gray-600 text-center">
                            Please select a module first to view available lessons
                          </p>
                        </div>
                      ) : isLoadingLessons ? (
                        <div className="py-3 text-sm text-gray-500 text-center">
                          Loading lessons...
                        </div>
                      ) : lessonsByModule && lessonsByModule.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-muted-foreground">
                              {field.value?.length || 0} of {lessonsByModule.length} selected
                            </p>
                            {field.value?.length > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => field.onChange([])}
                                className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                              >
                                Clear all
                              </Button>
                            )}
                          </div>
                          <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                            {lessonsByModule.map((lesson) => (
                              <div 
                                key={lesson.id} 
                                className={cn(
                                  "flex items-center space-x-2 p-2 rounded transition-colors",
                                  field.value?.includes(lesson.id) 
                                    ? "bg-muted/50" 
                                    : "hover:bg-muted/30"
                                )}
                              >
                                <Checkbox
                                  id={`lesson-${lesson.id}`}
                                  checked={field.value?.includes(lesson.id)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...(field.value || []), lesson.id]
                                      : (field.value || []).filter((id) => id !== lesson.id)
                                    field.onChange(newValue)
                                  }}
                                  className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                                />
                                <Label 
                                  htmlFor={`lesson-${lesson.id}`}
                                  className="cursor-pointer flex-1 text-sm"
                                >
                                  {lesson.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                          <p className="text-sm text-gray-600 text-center">
                            No lessons available for this module
                          </p>
                        </div>
                      )}
                    </div>
                    {field.value?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {field.value.map((id) => {
                          const lesson = lessonsByModule?.find(l => l.id === id);
                          return (
                            <Badge 
                              key={id} 
                              variant="pending"
                              className="px-3 py-1.5 text-sm flex items-center"
                            >
                              <span className="mr-1">{lesson?.name || id}</span>
                              <button
                                type="button"
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/20 p-0.5"
                                onClick={() => {
                                  field.onChange(field.value.filter(val => val !== id))
                                }}
                              >
                                <span className="sr-only">Remove</span>
                                <svg 
                                  width="15" 
                                  height="15" 
                                  viewBox="0 0 15 15" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-3.5 w-3.5"
                                >
                                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Delivery Method */}
              <FormField
                control={form.control}
                name="deliveryMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Method</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select delivery method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OFFLINE">Offline</SelectItem>
                          <SelectItem value="ONLINE">Online</SelectItem>
                          <SelectItem value="SELF_PACED">Self-paced</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Start Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Starts On</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={formatDateForInput(field.value)}
                          onChange={(e) => {
                            const newDate = parseDateFromInput(e.target.value)
                            field.onChange(newDate)
                          }}
                          className="w-full justify-start text-left font-normal"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-end justify-center">
                  <span className="text-sm font-medium mb-3">at</span>
                </div>
                
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* End Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ends On</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          value={formatDateForInput(field.value)}
                          onChange={(e) => {
                            const newDate = parseDateFromInput(e.target.value)
                            field.onChange(newDate)
                          }}
                          className="w-full justify-start text-left font-normal"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-end justify-center">
                  <span className="text-sm font-medium mb-3">at</span>
                </div>
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Number of Students */}
              <FormField
                control={form.control}
                name="numberOfStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Students</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        {...field} 
                        onChange={e => {
                          const value = e.target.value === "" ? 0 : Number(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        placeholder="Enter number of students" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Training Venue */}
              {deliveryMethod === "OFFLINE" && (
                <FormField
                  control={form.control}
                  name="trainingVenueId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Venue</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={isLoadingVenues}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select training venue" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                            {isLoadingVenues ? (
                              <SelectItem value="loading" disabled>
                                Loading venues...
                              </SelectItem>
                            ) : venuesData?.venues?.length ? (
                              venuesData.venues.map((venue) => (
                                <SelectItem key={venue.id} value={venue.id}>
                                  {venue.name} - {venue.location}, {venue.city.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No venues available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Training Link (Rendered unconditionally, hidden via CSS) */}
              <FormField
                control={form.control}
                name="trainingLink"
                render={({ field }) => (
                  <FormItem className={cn(
                    // Add any necessary spacing classes here, e.g., "space-y-1"
                    (deliveryMethod !== "ONLINE" && deliveryMethod !== "SELF_PACED") && "hidden"
                  )}>
                    <FormLabel>Training Link</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        // Ensure the value is not null/undefined for the input
                        value={field.value || ''} 
                        placeholder="Enter meeting link (Zoom, Teams, etc.)" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Venue Requirements (for offline delivery) */}
              {deliveryMethod === "OFFLINE" && (
                <>
                  <FormField
                    control={form.control}
                    name="meetsRequirement"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          The Training Venue meets the technological and tools requirement?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex items-center space-x-6 pt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="req-yes" />
                              <Label htmlFor="req-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="req-no" />
                              <Label htmlFor="req-no">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Requirement Remark (if venue doesn't meet requirements) */}
                  {!meetsRequirement && (
                    <FormField
                      control={form.control}
                      name="requirementRemark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>If No, Please add remark</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Enter requirement remark" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}
              
              {/* Trainer Compensation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trainerCompensationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer compensation type</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select compensation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PER_HOUR">Per Hour</SelectItem>
                            <SelectItem value="PER_TRAINEES">Per Trainee</SelectItem>

                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="trainerCompensationAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          {...field} 
                          onChange={e => {
                            const value = e.target.value === "" ? 0 : Number(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                          placeholder="Enter amount" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Number of Assistant Trainers */}
              <FormField
                control={form.control}
                name="numberOfAssistantTrainer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Assistant Trainer</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        {...field} 
                        onChange={e => {
                          const value = e.target.value === "" ? 0 : Number(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        placeholder="Enter number of assistant trainers" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Assistant Trainer Compensation (if there are assistant trainers) */}
              {numberOfAssistantTrainer > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assistantTrainerCompensationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assistant Trainer compensation (Optional)</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select compensation type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PER_HOUR">Per Hour</SelectItem>
                              <SelectItem value="PER_TRAINEES">Per Trainee</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assistantTrainerCompensationAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            {...field} 
                            onChange={e => {
                              const value = e.target.value === "" ? 0 : Number(e.target.value);
                              field.onChange(isNaN(value) ? 0 : value);
                            }}
                            placeholder="Enter amount" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </form>
          </Form>
        </div>
      </ScrollArea>
      
      {/* Fixed footer with buttons */}
      <div className="absolute bottom-0 left-0 right-0 py-4 px-6 bg-white border-t flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Back
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isAddingSession}
          className="bg-brand text-white"
        >
          {isAddingSession ? "Creating Session..." : "Create Session"}
        </Button>
      </div>
    </div>
  )
} 