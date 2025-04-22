import { Search, Filter } from 'lucide-react';
import { JobStatus } from '@/lib/hooks/useJobs';

interface JobsHeaderProps {
  activeStatus: JobStatus | undefined;
  onFilterChange: (status: JobStatus | undefined) => void;
  onSearchChange: (query: string) => void;
}

// Helper component for individual filter buttons in the segmented control
const FilterButton = ({ text, isActive, onClick }: { text: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    // Apply distinct styles for active and inactive states based on User feedback
    // Active: Light gray background, dark text, shadow
    // Inactive: White background, medium gray text
    // Shared: Padding, font, rounded corners on ends
    className={`px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none first:rounded-l-[7px] last:rounded-r-[7px] ${ // Removed border-r classes
      isActive
        ? 'bg-gray-50 text-gray-800 shadow-sm' // Active state: Light gray bg, dark text (User preference)
        : 'bg-white text-gray-600 hover:bg-gray-100' // Inactive state: White bg (User preference)
    }`}
  >
    {text}
  </button>
);

export function JobsHeader({ activeStatus, onFilterChange, onSearchChange }: JobsHeaderProps) {
  const handleFilterClick = (status: JobStatus | undefined) => {
    onFilterChange(status);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3">
      {/* Updated container div for segmented control with divide-x, removed p-1 */}
      <div className="flex items-center border border-gray-300 rounded-lg shadow-sm space-x-0 divide-x divide-gray-300">
        <FilterButton
          text="View All"
          isActive={activeStatus === undefined}
          onClick={() => handleFilterClick(undefined)}
        />
        <FilterButton
          text="Active"
          isActive={activeStatus === 'ACTIVE'}
          onClick={() => handleFilterClick('ACTIVE')}
        />
         <FilterButton
          text="New" // Added Inactive based on JobStatus type
          isActive={activeStatus === 'INACTIVE'}
          onClick={() => handleFilterClick('INACTIVE')}
        />
        {/* <FilterButton
          text="Completed"
          isActive={activeStatus === 'COMPLETED'}
          onClick={() => handleFilterClick('COMPLETED')}
        /> */}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Search Input */}
        {/* Adjusted styling for search input based on Figma */}
        <div className="relative flex-grow md:flex-grow-0">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search" // Simplified placeholder
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-[300px] border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B75FF] focus:border-[#0B75FF] text-sm shadow-sm"
          />
        </div>

        {/* Filter Button - Styled based on Figma */}
        {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0B75FF] shadow-sm">
          <Filter className="h-4 w-4" />
          Filter
        </button> */}
      </div>
    </div>
  );
} 