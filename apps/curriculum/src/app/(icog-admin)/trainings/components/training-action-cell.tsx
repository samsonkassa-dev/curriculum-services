/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Training } from "@/types/training";


export function TrainingActionCell({ row }: { row: any }) {
  const router = useRouter();
  const item = row.original as Training;

  const handleView = () => {
    // Use a default companyId or handle it in the destination page
    router.push(`/icog-admin/training/${item.id}`);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        className="h-8 w-8 p-0 text-blue-500"
        onClick={handleView}
      >
        <span className="sr-only">View</span>
        <img src="/eye.svg" alt="View" className="w-5 h-5" />
      </Button>
    </div>
  );
}
