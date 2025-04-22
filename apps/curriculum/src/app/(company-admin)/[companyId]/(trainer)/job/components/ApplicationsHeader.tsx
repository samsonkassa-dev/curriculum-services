import { Search } from 'lucide-react';
import { ApplicationStatus } from "@/lib/hooks/useJobs";

interface ApplicationsHeaderProps {
  activeStatus: ApplicationStatus | undefined;
  onFilterChange: (status: ApplicationStatus | undefined) => void;
  onSearchChange?: (query: string) => void;
}

// Helper component for individual filter buttons in the segmented control
const FilterButton = ({ text, isActive, onClick }: { text: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none first:rounded-l-[7px] last:rounded-r-[7px] ${
      isActive
        ? 'bg-gray-50 text-gray-800 shadow-sm'
        : 'bg-white text-gray-600 hover:bg-gray-100'
    }`}
  >
    {text}
  </button>
);

export const ApplicationsHeader = ({
  activeStatus,
  onFilterChange,
  onSearchChange,
}: ApplicationsHeaderProps) => {
  const handleFilterClick = (status: ApplicationStatus | undefined) => {
    onFilterChange(status);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3">
      <div className="flex items-center border border-gray-300 rounded-lg shadow-sm space-x-0 divide-x divide-gray-300">
        <FilterButton
          text="View All"
          isActive={activeStatus === undefined}
          onClick={() => handleFilterClick(undefined)}
        />
        <FilterButton
          text="Accepted"
          isActive={activeStatus === 'ACCEPTED'}
          onClick={() => handleFilterClick('ACCEPTED')}
        />
        <FilterButton
          text="Rejected"
          isActive={activeStatus === 'REJECTED'}
          onClick={() => handleFilterClick('REJECTED')}
        />
        <FilterButton
          text="Pending"
          isActive={activeStatus === 'PENDING'}
          onClick={() => handleFilterClick('PENDING')}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Search Input */}
        <div className="relative flex-grow md:flex-grow-0">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-[300px] border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B75FF] focus:border-[#0B75FF] text-sm shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}; 