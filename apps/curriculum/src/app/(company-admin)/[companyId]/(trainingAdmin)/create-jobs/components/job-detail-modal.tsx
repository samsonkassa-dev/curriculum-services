"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { useJobDetail, useUpdateJob, Session as JobSession } from "@/lib/hooks/useJobs"
import { useTrainings } from "@/lib/hooks/useTrainings"
import { useCohorts } from "@/lib/hooks/useCohorts"
import { useCohortSessions } from "@/lib/hooks/useSession"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Calendar, Clock, Check, Loader2, Eye, Edit } from "lucide-react"
import { cn } from "@/lib/utils"

// Zod Schema for edit mode
const editJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  trainingId: z.string({ required_error: "Training must be selected" }), 
  cohortId: z.string({ required_error: "Cohort must be selected" }),
  deadlineDate: z.string({ required_error: "Application deadline date is required" })
                 .refine(val => val && !isNaN(Date.parse(val)), {
                   message: "Valid date is required",
                 }),
  deadlineTime: z.string({ required_error: "Application deadline time is required" }),
  sessionIds: z.array(z.string()).min(1, "At least one session must be selected"),
})

type EditJobFormValues = z.infer<typeof editJobSchema>

interface JobDetailModalProps {
  jobId: string
  isOpen: boolean
  onClose: () => void
  mode?: 'view' | 'edit'
}

// Session interface for type safety (using the one from useJobs)
type Session = JobSession;

// Function to determine badge variant based on status
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'active' 
    case 'INACTIVE':
      return 'deactivated' 
    case 'COMPLETED':
      return 'approved'
    default:
      return 'pending'
  }
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

export function JobDetailModal({ jobId, isOpen, onClose, mode = 'view' }: JobDetailModalProps) {
  const { data: job, isLoading, error } = useJobDetail(jobId)
  const { updateJob, isLoading: isUpdating, isSuccess: isUpdateSuccess } = useUpdateJob()
  
  const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(mode)
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | undefined>(undefined)
  const [selectedCohortId, setSelectedCohortId] = useState<string | undefined>(undefined)
  const [prefillComplete, setPrefillComplete] = useState(false);

  // Fetch data for edit mode
  const { data: trainingsData, isLoading: trainingsLoading } = useTrainings({
    isArchived: false 
  });

  const { data: cohortsData, isLoading: cohortsLoading } = useCohorts({
    trainingId: selectedTrainingId || "", 
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useCohortSessions({
    cohortId: selectedCohortId || "", 
  });

  // Memoize safe access to data
  const safeCohorts = useMemo(() => 
    cohortsData?.cohorts?.length ? cohortsData.cohorts : [], 
    [cohortsData?.cohorts]
  );
  const safeSessions = useMemo(() => 
    sessionsData?.sessions?.length ? sessionsData.sessions : [], 
    [sessionsData?.sessions]
  );

  // Get all available sessions (existing job sessions + cohort sessions)
  const allAvailableSessions = useMemo(() => {
    const jobSessions = job?.sessions || [];
    const cohortSessions = safeSessions || [];
    
    // Create a map to avoid duplicates
    const sessionMap = new Map();
    
    // Add job sessions first (these are the already selected ones)
    jobSessions.forEach(session => {
      sessionMap.set(session.id, session);
    });
    
    // Add cohort sessions (for additional options when editing)
    cohortSessions.forEach(session => {
      if (!sessionMap.has(session.id)) {
        sessionMap.set(session.id, session);
      }
    });
    
    return Array.from(sessionMap.values());
  }, [job?.sessions, safeSessions]);

  const form = useForm<EditJobFormValues>({
    resolver: zodResolver(editJobSchema),
    defaultValues: {
      title: "",
      description: "",
      trainingId: "",
      cohortId: "",
      deadlineDate: "", 
      deadlineTime: "09:00", 
      sessionIds: [],
    },
  })

  // Get current value of sessionIds from form
  const sessionIds = form.watch("sessionIds");

  // Memoize options
  const trainingOptions = useMemo(() => 
    trainingsData?.trainings?.map(t => ({ value: t.id, label: t.title })) || [],
    [trainingsData?.trainings]
  );

  const cohortOptions = useMemo(() => 
    safeCohorts.map(c => ({ value: c.id, label: c.name })),
    [safeCohorts]
  );

  // Memoize handlers
  const handleSelectSession = useCallback((sessionId: string) => {
    if (currentMode !== 'edit') return;
    
    const currentSessionIds = form.getValues("sessionIds");
    let newSessionIds: string[];
    
    if (currentSessionIds.includes(sessionId)) {
      newSessionIds = currentSessionIds.filter(id => id !== sessionId);
    } else {
      newSessionIds = [...currentSessionIds, sessionId];
    }
    
    form.setValue('sessionIds', newSessionIds, { shouldValidate: true });
  }, [currentMode]);

  const handleRemoveSession = useCallback((sessionId: string) => {
    if (currentMode !== 'edit') return;
    
    const currentSessionIds = form.getValues("sessionIds");
    const newSessionIds = currentSessionIds.filter(id => id !== sessionId);
    form.setValue('sessionIds', newSessionIds, { shouldValidate: true });
  }, [currentMode]);

  const onSubmit = useCallback((data: EditJobFormValues) => {
    if (currentMode !== 'edit') return;
    
    const combinedDeadline = `${data.deadlineDate}T${data.deadlineTime}:00`;
    
    const payload = {
      title: data.title,
      description: data.description,
      deadlineDate: combinedDeadline,
      sessionIds: data.sessionIds,
    };
    
    updateJob({ jobId, jobData: payload });
  }, [currentMode, jobId, updateJob]);

  const handleTrainingChange = useCallback((trainingId: string) => {
    if (currentMode !== 'edit' || !trainingId || trainingId === selectedTrainingId) return;
    
    // If user changes training manually, clear cohort & sessions
    setSelectedTrainingId(trainingId);
    setSelectedCohortId(undefined);
    form.setValue("trainingId", trainingId, { shouldValidate: true });
    form.setValue("cohortId", "", { shouldValidate: true });
    form.setValue("sessionIds", [], { shouldValidate: true });
  }, [currentMode, selectedTrainingId]);

  const handleCohortChange = useCallback((cohortId: string) => {
    if (currentMode !== 'edit' || !cohortId || cohortId === selectedCohortId) return;
    
    setSelectedCohortId(cohortId);
    form.setValue("cohortId", cohortId, { shouldValidate: true });
    form.setValue("sessionIds", [], { shouldValidate: true });
  }, [currentMode, selectedCohortId]);

  const switchToEditMode = () => {
    setCurrentMode('edit');
  };

  const switchToViewMode = () => {
    setCurrentMode('view');
    // Reset form state
    setSelectedTrainingId(undefined);
    setSelectedCohortId(undefined);
  };

  // Handle successful update
  useEffect(() => {
    if (isUpdateSuccess) {
      setCurrentMode('view');
      setSelectedTrainingId(undefined);
      setSelectedCohortId(undefined);
    }
  }, [isUpdateSuccess]);

  // Populate form when switching to edit mode
  useEffect(() => {
    if (currentMode === 'edit' && job && isOpen) {
      // Set basic form fields
      form.setValue("title", job.title);
      form.setValue("description", job.description);
      
      // Parse deadline date and time
      const deadlineDate = new Date(job.deadlineDate);
      const dateString = deadlineDate.toISOString().split('T')[0];
      const timeString = deadlineDate.toTimeString().slice(0, 5);
      
      form.setValue("deadlineDate", dateString);
      form.setValue("deadlineTime", timeString);
      form.setValue("sessionIds", job.sessions.map(s => s.id));
      
      // Mark prefill as done
      setPrefillComplete(true);
    }
  }, [currentMode, job, isOpen]);

  // Set training and cohort when data is available
  useEffect(() => {
    if (currentMode === 'edit' && job && isOpen && trainingsData?.trainings) {
      const firstSession = job.sessions[0];
      if (firstSession && firstSession.cohort) {
        const trainingTitle = firstSession.cohort.trainingTitle;
        const matchingTraining = trainingsData.trainings.find(t => t.title === trainingTitle);
        
        if (matchingTraining && selectedTrainingId !== matchingTraining.id) {
          setSelectedTrainingId(matchingTraining.id);
          form.setValue("trainingId", matchingTraining.id);
        }
      }
    }
  }, [currentMode, job, isOpen, trainingsData?.trainings, selectedTrainingId]);

  // Set cohort when cohorts data is available
  useEffect(() => {
    if (currentMode === 'edit' && job && isOpen && cohortsData?.cohorts && selectedTrainingId) {
      const firstSession = job.sessions[0];
      if (firstSession && firstSession.cohort) {
        const cohortId = firstSession.cohort.id;
        const cohortExists = cohortsData.cohorts.find(c => c.id === cohortId);
        if (cohortExists && selectedCohortId !== cohortId) {
          setSelectedCohortId(cohortId);
          form.setValue("cohortId", cohortId);
        }
      }
    }
  }, [currentMode, job, isOpen, cohortsData?.cohorts, selectedTrainingId, selectedCohortId]);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedTrainingId(undefined);
      setSelectedCohortId(undefined);
      setCurrentMode(mode);
    }
  }, [isOpen, mode]);

  const minDate = useMemo(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }, []);

  // inside component after TIME_OPTIONS definition add code (place near other hooks)
  const selectedTimeValue = form.watch("deadlineTime");
  const displayTimeOptions = useMemo(() => {
    if (!selectedTimeValue) return TIME_OPTIONS;
    const exists = TIME_OPTIONS.some(opt => opt.value === selectedTimeValue);
    if (exists) return TIME_OPTIONS;
    // create label for arbitrary time
    const [hourStr, minuteStr] = selectedTimeValue.split(":");
    const hourNum = parseInt(hourStr, 10);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    const label = `${displayHour}:${minuteStr} ${period}`;
    return [{ label, value: selectedTimeValue }, ...TIME_OPTIONS];
  }, [selectedTimeValue]);

  // Make sure we don't try to access the Dialog when not open
  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[800px] p-0 rounded-2xl max-h-[85vh] overflow-hidden" 
      >
        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
            <div className="p-6 flex justify-center">
              <Loading />
            </div>
          </>
        ) : error || !job ? (
          <>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-red-600">Failed to load job details.</p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="px-10 py-6 border-b border-[#DCDCDC] sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold">
                  {currentMode === 'view' ? 'Job Information' : 'Edit Job'}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  {currentMode === 'view' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={switchToEditMode}
                      className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={switchToViewMode}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  )}
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
              {currentMode === 'view' ? (
                // View Mode
                <div>
                  <div className="px-8 py-3.5">
                    <h3 className="text-lg font-bold">General Info</h3>
                  </div>

                  <div className="px-10 space-y-3">
                    {/* Job Title */}
                    <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                      <span className="text-[#5D5D5D]">Job Title</span>
                      <span>{job.title}</span>
                    </div>

                    {/* Description */}
                    <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                      <span className="text-[#5D5D5D]">Description</span>
                      <span className="w-3/4 text-left">{job.description}</span>
                    </div>

                    {/* Number of Sessions */}
                    <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                      <span className="text-[#5D5D5D]">Number of Sessions</span>
                      <span>{job.numberOfSessions}</span>
                    </div>

                    {/* Date Posted */}
                    <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                      <span className="text-[#5D5D5D]">Date Posted</span>
                      <span>{format(new Date(job.createdAt), 'dd MMM yyyy')}</span>
                    </div>

                    {/* Deadline Date */}
                    <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                      <span className="text-[#5D5D5D]">Application Deadline</span>
                      <div className="text-right">
                        <div>{format(new Date(job.deadlineDate), 'dd MMM yyyy')}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(job.deadlineDate), 'h:mm a')}
                        </div>
                      </div>
                    </div>

                    {/* Applicants Required */}
                    <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                      <span className="text-[#5D5D5D]">Applicants Required</span>
                      <span>{job.applicantsRequired}</span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center py-3.5 border-b border-[#E8E8E8]">
                      <span className="text-[#5D5D5D]">Status</span>
                      <Badge 
                        variant={getStatusBadgeVariant(job.status)} 
                        className="capitalize"
                      >
                        {job.status?.toLowerCase()}
                      </Badge>
                    </div>

                    {/* Sessions */}
                    <div className="py-3.5">
                      <span className="text-[#5D5D5D]">Sessions</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.sessions.map((session) => (
                          <Badge key={session.id} variant="secondary">
                            {session.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <>
                  {!prefillComplete ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 px-6">
                      {/* Loading overlay when training/cohort/session data is loading */}
                      {(trainingsLoading && !trainingsData) && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                          </div>
                        </div>
                      )}

                      {/* Job Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Lead Frontend Trainer"
                          {...form.register("title")}
                          disabled={isUpdating}
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
                          disabled={isUpdating}
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
                          disabled={trainingsLoading || isUpdating}
                        >
                          <SelectTrigger id="trainingId">
                            <SelectValue placeholder={trainingsLoading ? "Loading trainings..." : "Select a training"} />
                          </SelectTrigger>
                          <SelectContent>
                            {trainingOptions.length === 0 && !trainingsLoading ? (
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

                      {/* Select Cohort */}
                      <div className="space-y-2">
                        <Label htmlFor="cohortId">Select Cohort</Label>
                        <Select 
                          onValueChange={handleCohortChange}
                          value={selectedCohortId}
                          disabled={!selectedTrainingId || cohortsLoading || isUpdating}
                        >
                          <SelectTrigger id="cohortId">
                            <SelectValue placeholder={
                              !selectedTrainingId 
                                ? "Select a training first" 
                                : cohortsLoading 
                                  ? "Loading cohorts..." 
                                  : "Select a cohort"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {cohortOptions.length === 0 && !cohortsLoading && selectedTrainingId ? (
                               <SelectItem value="no-cohorts" disabled>No cohorts found for this training</SelectItem>
                            ) : (
                              cohortOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.cohortId && (
                          <p className="text-sm text-red-600">{form.formState.errors.cohortId.message}</p>
                        )}
                      </div>

                      {/* Select Sessions */}
                      <div className="space-y-2">
                        <Label htmlFor="sessions">Select Sessions</Label>
                        
                        {/* Selected Sessions Display */}
                        {sessionIds && sessionIds.length > 0 && (
                          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 min-h-[2.5rem]">
                            {sessionIds.map((id) => {
                              const session = allAvailableSessions.find((s: Session) => s.id === id);
                              return (
                                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                  {session?.name || 'Unknown Session'}
                                  <X 
                                    className="h-3 w-3 cursor-pointer" 
                                    onClick={() => handleRemoveSession(id)}
                                  />
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        <Select 
                          onValueChange={handleSelectSession}
                          value="" // Always empty to allow multiple selections
                          disabled={sessionsLoading || isUpdating}
                        >
                          <SelectTrigger id="sessions">
                            <SelectValue placeholder={
                              sessionsLoading 
                                ? "Loading sessions..." 
                                : sessionIds.length > 0
                                  ? `${sessionIds.length} session${sessionIds.length === 1 ? '' : 's'} selected`
                                  : "Select sessions..."
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {allAvailableSessions.length === 0 && !sessionsLoading ? (
                               <SelectItem value="no-sessions" disabled>No sessions available</SelectItem>
                            ) : (
                              allAvailableSessions.map((session: Session) => (
                                <SelectItem 
                                  key={session.id} 
                                  value={session.id}
                                  className={cn(
                                    "flex items-center",
                                    sessionIds.includes(session.id) && "bg-blue-50"
                                  )}
                                >
                                  <div className="flex items-center w-full">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        sessionIds.includes(session.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div>
                                      <div className="font-medium">{session.name}</div>
                                      {session.startDate && session.endDate && (
                                        <div className="text-xs text-gray-500">
                                          {format(new Date(session.startDate), 'MMM dd')} - {format(new Date(session.endDate), 'MMM dd, yyyy')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        
                        {form.formState.errors.sessionIds && (
                          <p className="text-sm text-red-600">{form.formState.errors.sessionIds.message}</p>
                        )}
                      </div>

                      {/* Application Deadline */}
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
                              disabled={isUpdating}
                              min={minDate}
                            />
                          </div>
                          
                          {/* "at" text */}
                          <span className="text-gray-500">at</span>
                          
                          {/* Time Picker */}
                          <div className="relative w-[191px]">
                            <Select
                              onValueChange={(value) => form.setValue("deadlineTime", value, { shouldValidate: true })}
                              value={selectedTimeValue}
                              disabled={isUpdating}
                            >
                              <SelectTrigger id="deadlineTime" className="w-full">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                  <SelectValue placeholder="Select time" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {displayTimeOptions.map((option) => (
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
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={onClose} 
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white" 
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {isUpdating ? "Updating..." : "Update Job"}
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 