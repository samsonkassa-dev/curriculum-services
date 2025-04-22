"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
// import { format } from "date-fns" // No longer needed for submission

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAddJob } from "@/lib/hooks/useJobs"
import { useTrainings } from "@/lib/hooks/useTrainings"
import { useSessions } from "@/lib/hooks/useSession"
import { Loader2, Calendar, Clock, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Update Zod Schema for date and time
const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  trainingId: z.string({ required_error: "Training must be selected" }), 
  // Separate date and time fields
  deadlineDate: z.string({ required_error: "Application deadline date is required" })
                 .refine(val => val && !isNaN(Date.parse(val)), {
                   message: "Valid date is required",
                 }),
  deadlineTime: z.string({ required_error: "Application deadline time is required" }),
  sessionIds: z.array(z.string()).min(1, "At least one session must be selected"),
})

type CreateJobFormValues = z.infer<typeof createJobSchema>

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
}

// Session interface for type safety
interface Session {
  id: string;
  name: string;
}

// Generate time options in 30-minute intervals with AM/PM format
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayMinute = minute === 0 ? '00' : minute;
      const label = `${displayHour}:${displayMinute} ${period}`;
      
      // Value stored as 24-hour format for API
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      const value = `${hourStr}:${minuteStr}`;
      
      options.push({ label, value });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
  const { addJob, isLoading: isSubmitting, isSuccess: isSubmitSuccess } = useAddJob()

  const [selectedTrainingId, setSelectedTrainingId] = useState<string | undefined>(undefined)
  const [openSessionsPopover, setOpenSessionsPopover] = useState(false)

  // Fetch Trainings
  const { data: trainingsData, isLoading: trainingsLoading, error: trainingsError } = useTrainings({
    isArchived: false // Fetch only active trainings
  });

  // Fetch Sessions based on selected Training
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useSessions({
    trainingIds: selectedTrainingId ? [selectedTrainingId] : [], // Pass selected training ID
  });

  // Safe access to sessions data
  const safeSessions = sessionsData?.sessions?.length
    ? sessionsData.sessions
    : [];

  const form = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      description: "",
      trainingId: undefined,
      deadlineDate: "", 
      deadlineTime: "09:00", // Default time to 9:00 AM
      sessionIds: [],
    },
  })

  // Get current value of sessionIds from form
  const sessionIds = form.watch("sessionIds");

  // Map Trainings to Select options
  const trainingOptions = trainingsData?.trainings?.map(t => ({ value: t.id, label: t.title })) || []; // Assuming t.title exists

  // Handle session selection toggle
  const handleSelectSession = (sessionId: string) => {
    const currentSessionIds = form.getValues("sessionIds");
    let newSessionIds: string[];
    
    if (currentSessionIds.includes(sessionId)) {
      // Remove the session if already selected
      newSessionIds = currentSessionIds.filter(id => id !== sessionId);
    } else {
      // Add the session if not selected
      newSessionIds = [...currentSessionIds, sessionId];
    }
    
    form.setValue('sessionIds', newSessionIds, { shouldValidate: true });
  };

  const onSubmit = (data: CreateJobFormValues) => {
    // Combine date and time for the API
    const combinedDeadline = `${data.deadlineDate}T${data.deadlineTime}:00`;
    
    // Ensure the payload structure matches what useAddJob expects
    const payload = {
      title: data.title,
      description: data.description,
      deadlineDate: combinedDeadline, // Combined date and time
      sessionIds: data.sessionIds,
    };
    
    addJob(payload);
  }

  // Reset form and close modal on successful submission
  useEffect(() => {
    if (isSubmitSuccess) {
      form.reset();
      setSelectedTrainingId(undefined); 
      onClose(); 
    }
  }, [isSubmitSuccess, onClose]);

  // Reset session selection when training changes
  useEffect(() => {
    if (selectedTrainingId) {
      form.setValue("sessionIds", [], { shouldValidate: true });
    }
  }, [selectedTrainingId]);

  // Prevent closing modal by clicking outside or pressing Esc
  const handleInteractOutside = (event: Event) => {
    event.preventDefault();
  };

  const handleTrainingChange = (trainingId: string) => {
    setSelectedTrainingId(trainingId);
    form.setValue("trainingId", trainingId, { shouldValidate: true });
  }
  
  // Helper to get current date string in YYYY-MM-DD format
  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // Toggle sessions popover
  const toggleSessionsPopover = () => {
    setOpenSessionsPopover(prev => !prev);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto"
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleInteractOutside}
      >
        <DialogHeader>
          <DialogTitle>New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g., Lead Frontend Trainer"
              {...form.register("title")}
              disabled={isSubmitting}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and required skills..."
              {...form.register("description")}
              rows={4}
              disabled={isSubmitting}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Select Training */}
          <div className="space-y-2">
            <Label htmlFor="trainingId">Select Training</Label>
            <Select 
              onValueChange={handleTrainingChange}
              value={selectedTrainingId}
              disabled={trainingsLoading || isSubmitting}
            >
              <SelectTrigger id="trainingId">
                <SelectValue placeholder={trainingsLoading ? "Loading trainings..." : "Select a training"} />
              </SelectTrigger>
              <SelectContent>
                {trainingsError ? (
                  <SelectItem value="error" disabled>Error loading trainings</SelectItem>
                ) : trainingOptions.length === 0 && !trainingsLoading ? (
                   <SelectItem value="no-trainings" disabled>No active trainings found</SelectItem>
                ) : (
                  trainingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.trainingId && (
              <p className="text-sm text-red-600">{form.formState.errors.trainingId.message}</p>
            )}
          </div>

          {/* Select Sessions - Using normal div structure to ensure visibility */}
          <div className="space-y-2">
            <Label htmlFor="sessions">Select Sessions</Label>
            <div className="w-full relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between py-6"
                onClick={toggleSessionsPopover}
                disabled={!selectedTrainingId || sessionsLoading || isSubmitting || !!sessionsError}
              >
                <div className="flex flex-wrap gap-1 items-center">
                  {sessionIds && sessionIds.length > 0 ? (
                    <>
                      {sessionIds.slice(0, 1).map((id, index) => {
                        const session = safeSessions.find((s: Session) => s.id === id);
                        return (
                          <Badge key={`session-${id}-${index}`} variant="pending">
                            {session?.name}
                          </Badge>
                        );
                      })}
                      {sessionIds.length > 1 && (
                        <span className="text-sm text-gray-500 ml-1">
                          + {sessionIds.length - 1} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span>
                      {!selectedTrainingId 
                        ? "Select a training first" 
                        : sessionsLoading 
                          ? "Loading sessions..." 
                          : "Select sessions for this job..."}
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {/* Manual dropdown that shows regardless of Popover state */}
              {openSessionsPopover && (
                <div className="absolute z-50 w-full mt-1 border rounded-md bg-white shadow-lg max-h-[300px] overflow-auto">
                  {safeSessions.length > 0 ? (
                    safeSessions.map((session: Session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100",
                          sessionIds.includes(session.id) && "bg-gray-100"
                        )}
                        onClick={() => handleSelectSession(session.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            sessionIds.includes(session.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {session.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {sessionsError 
                        ? "Error loading sessions" 
                        : selectedTrainingId && !sessionsLoading 
                          ? "No sessions available for this training" 
                          : "Please select a training first"}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {form.formState.errors.sessionIds && (
              <p className="text-sm text-red-600">{form.formState.errors.sessionIds.message}</p>
            )}
          </div>

          {/* Application Deadline - Date and Time side by side */}
          <div className="space-y-2">
            <Label htmlFor="deadlineDate">Application Deadline</Label>
            <div className="flex items-center gap-2">
              {/* Date Picker */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  id="deadlineDate"
                  type="date"
                  {...form.register("deadlineDate")}
                  className="pl-10"
                  disabled={isSubmitting}
                  min={getMinDate()}
                />
              </div>
              
              {/* "at" text */}
              <span className="text-gray-500">at</span>
              
              {/* Time Picker - Replace Input with Select */}
              <div className="relative w-[191px]">
                <Select
                  onValueChange={(value) => form.setValue("deadlineTime", value, { shouldValidate: true })}
                  value={form.watch("deadlineTime")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="deadlineTime" className="w-full">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <SelectValue placeholder="Select time" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Error messages */}
            {(form.formState.errors.deadlineDate || form.formState.errors.deadlineTime) && (
              <p className="text-sm text-red-600">
                {form.formState.errors.deadlineDate?.message || form.formState.errors.deadlineTime?.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => { form.reset(); setSelectedTrainingId(undefined); onClose(); }} disabled={isSubmitting}>
                Back
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 