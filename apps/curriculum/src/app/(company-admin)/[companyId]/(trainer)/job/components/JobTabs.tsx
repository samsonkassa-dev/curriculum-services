import { useParams } from "next/navigation";

interface JobTabsProps {
  activeTab: 'jobs' | 'applications';
  onTabChange: (tab: 'jobs' | 'applications') => void;
}

export const JobTabs = ({ activeTab, onTabChange }: JobTabsProps) => {
  const { companyId } = useParams<{ companyId: string }>();

  return (
    <div className="border-[#CED4DA] flex">
      <div className="flex space-x-12">
        <button
          onClick={() => onTabChange('jobs')}
          className={`py-2.5 ${
            activeTab === 'jobs'
              ? "border-b-2 border-[#0B75FF] font-semibold text-[#0B75FF]"
              : "font-normal text-[#565555]"
          }`}
        >
          Jobs
        </button>
        <button
          onClick={() => onTabChange('applications')}
          className={`py-2.5 px-4.5 ${
            activeTab === 'applications'
              ? "border-b-2 border-[#0B75FF] font-semibold text-[#0B75FF]"
              : "font-normal text-[#565555]"
          }`}
        >
          My Applications
        </button>
      </div>
    </div>
  );
}; 