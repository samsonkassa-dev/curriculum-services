"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { TrainingCard } from "@/components/ui/training-card";
import { usePaginatedTrainings } from "@/lib/hooks/useTrainings";
import { Loading } from "@/components/ui/loading";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEffect, useState } from "react";
import { DataTable } from "../basedata/data-table";
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

  const trainingStartIndex = (page - 1) * pageSize;
  const trainingEndIndex = trainingStartIndex + pageSize;
  const trainingStartRecord = trainings.length ? trainingStartIndex + 1 : 0;
  const trainingEndRecord = Math.min(trainingEndIndex, trainings?.length);

  return (
    <div className="md:w-[calc(100%-85px)] md:pl-[85px] mx-auto lg:mt-12 mt-3 px-5">
      <div className="flex justify-between items-center mb-6 px-3">
        <div className="text-xl font-semibold max-lg:hidden">Trainings</div>
        <div className="flex items-center self-center lg:justify-end gap-3">
          <div className="relative md:w-[300px]">
            <Input
              placeholder="Search"
              className="pl-10 h-10 bg-white border-gray-200 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
      </div>
      <TrainingDataTable
        columns={trainingColumns}
        data={trainings}
        isLoading={isTrainingsLoading}
        pagination={{
          pageCount: trainingsData?.totalPages || 0,
          page: trainingsData?.currentPage || 0,
          setPage: handlePageChange,
          pageSize,
          setPageSize: handlePageSizeChange,
          showingText: `Showing ${trainingStartRecord} to ${trainingEndRecord} out of ${
            trainingsData?.trainings.length || 0
          } records`,
        }}
      />
    </div>
  );
}
