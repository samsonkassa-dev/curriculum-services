import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/lib/hooks/useJobs";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { JobDetailModal } from "./JobDetailModal";

interface ApplicationCardProps {
  application: Application;
}

export const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const formattedDate = new Date(application.createdAt).toLocaleDateString();
  const timeAgo = formatDistanceToNow(new Date(application.createdAt), { addSuffix: false });
  
  return (
    <>
      <div className="border border-[#D0D5DD] rounded-[6px] p-5 pt-[25px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="text-[18px] font-medium text-black font-inter leading-[1.39em]">{application.job.title}</h3>
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
                <span className="font-inter text-xs leading-[1.67em]">{application.job.numberOfSessions} Sessions</span>
              </div>
            </div>
          </div>
          <Badge variant={application.status.toLowerCase() as "pending" | "accepted" | "rejected"}>
            {application.status}
          </Badge>
        </div>
      
        <div className="flex justify-start">
          <p className="text-[14px] text-[#565555] font-inter leading-[1.36em] max-w-[387px]">{application.reason}</p>
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
        jobId={application.job.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hideActions={true}
      />
    </>
  );
}; 