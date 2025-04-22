import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

export const EmptyState = () => {
  const { companyId } = useParams<{ companyId: string }>();

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Jobs Available</h3>
        <p className="text-gray-500 mb-6">
          There are currently no jobs available. Check back later.
        </p>
        {/* <Link href={`/${companyId}/job/create`}>
          <Button className="bg-[#0B75FF] text-white px-5 py-2.5 rounded-md">
            Create New Job
          </Button>
        </Link> */}
      </div>
    </div>
  );
}; 