"use client";

import { useState } from "react";
import { useJobs, JobStatus, useMyApplications, ApplicationStatus } from "@/lib/hooks/useJobs";
import { JobCard } from "./components/JobCard";
import { JobsHeader } from "./components/JobsHeader";
import { EmptyState } from "./components/EmptyState";
import { JobTabs } from "./components/JobTabs";
import { ApplicationCard } from "./components/ApplicationCard";
import { ApplicationsHeader } from "./components/ApplicationsHeader";

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [jobStatus, setJobStatus] = useState<JobStatus | undefined>(undefined);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | undefined>(undefined);
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [applicationSearchQuery, setApplicationSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: jobsData, isLoading: isJobsLoading, error: jobsError } = useJobs({
    status: jobStatus,
    page: currentPage,
    pageSize: 10
  });

  const { data: applicationsData, isLoading: isApplicationsLoading, error: applicationsError } = useMyApplications();
  
  const filteredJobs = jobsData?.jobs?.filter(job => 
    jobSearchQuery ? job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) : true
  ) || [];

  const filteredApplications = applicationsData?.applications?.filter(application => {
    const matchesStatus = applicationStatus ? application.status === applicationStatus : true;
    const matchesSearch = applicationSearchQuery 
      ? application.job.title.toLowerCase().includes(applicationSearchQuery.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  }) || [];

  const handleJobStatusChange = (newStatus: JobStatus | undefined) => {
    setJobStatus(newStatus);
    setCurrentPage(1);
  };

  const handleJobSearchChange = (query: string) => {
    setJobSearchQuery(query);
  };

  const handleApplicationStatusChange = (newStatus: ApplicationStatus | undefined) => {
    setApplicationStatus(newStatus);
  };

  const handleApplicationSearchChange = (query: string) => {
    setApplicationSearchQuery(query);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 px-4 md:px-14 lg:px-16 py-5">
        <div className="flex flex-col w-full pl-12">
          <JobTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="mt-4">
            {activeTab === 'jobs' ? (
              <>
                <JobsHeader 
                  activeStatus={jobStatus} 
                  onFilterChange={handleJobStatusChange}
                  onSearchChange={handleJobSearchChange}
                />
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isJobsLoading ? (
                    <div className="flex justify-center items-center h-60 col-span-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B75FF]"></div>
                    </div>
                  ) : jobsError ? (
                    <div className="text-center p-10 text-red-500 col-span-full">
                      Error loading jobs. Please try again later.
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="col-span-full">
                      <EmptyState />
                    </div>
                  ) : (
                    filteredJobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))
                  )}
                </div>
                
                {jobsData && jobsData.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: jobsData.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page
                            ? "bg-[#0B75FF] text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <ApplicationsHeader 
                  activeStatus={applicationStatus}
                  onFilterChange={handleApplicationStatusChange}
                  onSearchChange={handleApplicationSearchChange}
                />
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isApplicationsLoading ? (
                    <div className="flex justify-center items-center h-60 col-span-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B75FF]"></div>
                    </div>
                  ) : applicationsError ? (
                    <div className="text-center p-10 text-red-500 col-span-full">
                      Error loading applications. Please try again later.
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="col-span-full">
                      <EmptyState />
                    </div>
                  ) : (
                    filteredApplications.map(application => (
                      <ApplicationCard key={application.id} application={application} />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
