"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePaginatedTrainings } from "@/lib/hooks/useTrainings";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEffect, useState } from "react";
import { trainingColumns } from "./components/training-columns";
import { TrainingDataTable } from "./components/training-table";

export default function Trainings() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: trainingsData, isLoading: isTrainingsLoading } =
    usePaginatedTrainings({
      page,
      pageSize,
      searchQuery: debouncedSearch,
    });

  const trainings = trainingsData?.trainings || [];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const totalElements = trainingsData?.totalElements || 0;

  // Calculate showing ranges using API values
  const trainingStartRecord = trainings.length ? (page - 1) * pageSize + 1 : 0;
  const trainingEndRecord = Math.min(page * pageSize, totalElements);

  return (
    <div className="w-full lg:px-16 md:px-14 px-4 mx-auto lg:mt-12 mt-10">
      <div className="flex md:justify-end items-center md:pl-12">
        <div className="lg:justify-end gap-3">
          <div className="relative md:w-[300px]">
            <Input
              placeholder="Search by title"
              className="pl-10 h-10 bg-white border-gray-200 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <TrainingDataTable
          columns={trainingColumns}
          data={trainings}
          isLoading={isTrainingsLoading}
          pagination={{
            pageCount: trainingsData?.totalPages || 0,
            page,
            setPage: handlePageChange,
            pageSize,
            setPageSize: handlePageSizeChange,
            showingText:
              totalElements > 0
                ? `Showing ${trainingStartRecord} to ${trainingEndRecord} out of ${totalElements} records`
                : "No records to show",
          }}
        />
      </div>
    </div>
  );
}
