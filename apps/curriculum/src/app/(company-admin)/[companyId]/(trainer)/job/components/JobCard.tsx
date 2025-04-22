import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/hooks/useJobs";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { JobDetailModal } from "./JobDetailModal";

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const formattedDate = new Date(job.createdAt).toLocaleDateString();
  const timeAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: false });
  
  return (
    <>
      <div className="border border-[#D0D5DD] rounded-[6px] p-5 pt-[25px] flex flex-col gap-4">
        <div className="flex items-center gap-[93px]">
          <div className="flex flex-col gap-4">
            <h3 className="text-[18px] font-medium text-black font-inter leading-[1.39em]">{job.title}</h3>
            <div className="flex items-center gap-8 text-[#99948E]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <Image 
                    src="/calend.svg" 
                    alt="Calendar" 
                    width={16} 
                    height={16}
                    className="text-[#99948E]"
                  />
                </div>
                <span className="font-inter text-xs leading-[1.67em]">{formattedDate}</span>
                <span className="font-inter text-xs leading-[1.67em]">-</span>
                <span className="font-inter text-xs leading-[1.67em]">{job.deadlineDate ? new Date(job.deadlineDate).toLocaleDateString() : formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <Image 
                    src="/section.svg" 
                    alt="Sessions" 
                    width={16} 
                    height={16}
                    className="text-[#99948E]"
                  />
                </div>
                <span className="font-inter text-xs leading-[1.67em]">{job.numberOfSessions} Sessions</span>
              </div>
            </div>
          </div>
        </div>
      
        <div className="flex justify-start">
          <p className="text-[14px] text-[#565555] font-inter leading-[1.36em] max-w-[387px]">{job.description}</p>
        </div>
      
        <div className="w-[387px]">
          <p className="text-[10px] text-[#99948E] font-inter leading-[2em]">{timeAgo} ago</p>
        </div>
      
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-gray-50 text-[#0B75FF] text-xs font-medium border border-[#0B75FF] px-4 py-2 rounded-[6px] tracking-[0.167%] font-inter"
          >
            View Detail
          </Button>
        </div>
      </div>

      <JobDetailModal 
        jobId={job.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}; 