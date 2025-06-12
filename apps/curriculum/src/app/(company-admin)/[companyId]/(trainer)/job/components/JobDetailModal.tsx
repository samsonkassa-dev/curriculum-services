"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/hooks/useJobs";
import Image from "next/image";
import { useState } from "react";
import { useApplyForJob, useJobDetail } from "@/lib/hooks/useJobs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Badge } from "@/components/ui/badge";
import { DeliveryMethod } from "@/lib/hooks/useSession";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TrainingVenue {
  id: string;
  name: string;
  location: string;
  city: {
    id: string;
    name: string;
  };
}

interface JobDetailModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  hideActions?: boolean;
}

export const JobDetailModal = ({ jobId, isOpen, onClose, hideActions }: JobDetailModalProps) => {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [reason, setReason] = useState("");
  const [applicationType, setApplicationType] = useState<"MAIN" | "ASSISTANT">("MAIN");
  const { applyForJob, isLoading } = useApplyForJob();
  const { data: job, isLoading: isLoadingJob } = useJobDetail(jobId);

  const handleApply = () => {
    if (!reason.trim() || !job) return;
    
    applyForJob(
      { jobId: job.id, reason, applicationType },
      {
        onSuccess: () => {
          onClose();
          setReason("");
          setApplicationType("MAIN");
          setShowApplyForm(false);
        }
      }
    );
  };

  if (!job || isLoadingJob) {
    return null;
  }

  const formattedStartDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formattedEndDate = new Date(job.deadlineDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <VisuallyHidden>
          <DialogTitle>Job Details: {job.title}</DialogTitle>
        </VisuallyHidden>

        <div className="bg-white rounded-[10px] flex-1 overflow-y-auto">
          <div className="p-8 flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-[#D0D5DD] pb-4">
              <h2 className="text-[22px] font-semibold text-black">{job.title}</h2>
              <div className="flex items-center gap-1">
                <span className="text-[#414554] font-medium text-xs">Number of Sessions - </span>
                <span className="text-[#037847] font-semibold text-xs">{job.numberOfSessions}</span>
              </div>
            </div>

            {/* Description */}
            <div className="text-[#555252] text-base leading-[1.625]">
              {job.description}
            </div>

            {/* Session Cards */}
            <div className="space-y-4">
              {job.sessions?.map((session, index) => (
                <div key={session.id} className="border border-[#D0D5DD] rounded-[6px] p-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      <h3 className="text-lg font-medium">Session {index + 1}</h3>
                      <Badge 
                        variant={session.deliveryMethod === "ONLINE" ? "secondary" : "active"}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.deliveryMethod === "ONLINE"
                            ? "bg-[#ECFDF3] text-[#037847]" 
                            : "bg-[rgba(11,117,255,0.1)] text-[#0B75FF]"
                        }`}
                      >
                        {session.deliveryMethod === "ONLINE" ? "Online" : "In Person"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-9 text-xs text-[#99948E]">
                      <div className="flex items-center gap-1">
                        <Image src="/calend.svg" alt="Calendar" width={16} height={16} />
                        <span>{new Date(session.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image src="/time.svg" alt="Time" width={16} height={16} />
                        <span>{new Date(session.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image src="/student.svg" alt="Students" width={16} height={16} />
                        <span>{session.numberOfStudents}</span>
                      </div>
                      {session.trainingVenue && (
                        <div className="flex items-center gap-1">
                          <Image src="/location.svg" alt="Location" width={16} height={16} />
                          <span>
                            {typeof session.trainingVenue === 'string' 
                              ? session.trainingVenue 
                              : `${(session.trainingVenue as TrainingVenue).location}, ${(session.trainingVenue as TrainingVenue).city?.name || ''}`}
                          </span>
                        </div>
                      )}
                    </div>
                    {session.name && (
                      <p className="mt-4 text-sm text-[#565555]">{session.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-8 border-t border-[#99948E] pt-4">
              <div className="flex flex-col gap-2">
                <span className="text-[#99948E] text-sm font-medium">Start On</span>
                <span className="text-[#292827] text-base font-medium">{formattedStartDate}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[#99948E] text-sm font-medium">Ends On</span>
                <span className="text-[#292827] text-base font-medium">{formattedEndDate}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[#99948E] text-sm font-medium">Number of Sessions</span>
                <span className="text-[#292827] text-base font-medium">{job.numberOfSessions}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[#99948E] text-sm font-medium">Applicants Required</span>
                <span className="text-[#292827] text-base font-medium">{job.applicantsRequired}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        {!hideActions && (
          <div className="bg-white border-t border-[#D0D5DD] p-6">
            <div className="flex flex-col gap-4">
              {showApplyForm ? (
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="applicationType" className="text-base font-medium">
                      Application Type
                    </Label>
                    <Select value={applicationType} onValueChange={(value: "MAIN" | "ASSISTANT") => setApplicationType(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select application type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAIN">Main Trainer</SelectItem>
                        <SelectItem value="ASSISTANT">Assistant Trainer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reason" className="text-base font-medium">
                      Why do you want to apply for this position?
                    </Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter your reason"
                      className="min-h-[120px] w-full resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowApplyForm(false)}
                      className="border-[#99948E] text-[#99948E] hover:bg-gray-50 px-[42px] py-[14px] text-base font-semibold tracking-[1.25%]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApply}
                      disabled={isLoading || !reason.trim()}
                      className="bg-[#0B75FF] text-white hover:bg-[#0B75FF]/90 px-[42px] py-[14px] text-base font-semibold tracking-[1.25%]"
                    >
                      Submit Application
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-4">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="text-[#344054] hover:text-[#344054] hover:bg-gray-50"
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => setShowApplyForm(true)}
                    className="bg-[#0B75FF] text-white hover:bg-[#0B75FF]/90 px-[42px] py-[14px] text-base font-semibold tracking-[1.25%]"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 