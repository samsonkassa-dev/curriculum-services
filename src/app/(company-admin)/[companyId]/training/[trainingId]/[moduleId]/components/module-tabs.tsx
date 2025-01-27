"use client";

interface ModuleTabsProps {
  activeTab: string;
  onTabChange: (tab: "information" | "section" | "content") => void;
}

export function ModuleTabs({ activeTab, onTabChange }: ModuleTabsProps) {
  const tabs = [
    {
      id: "information",
      label: "Module Information",
      src: "/module.svg",
      srcActive: "/module-active.svg",
    },
    {
      id: "section",
      label: "Section",
      src: "/section.svg",
      srcActive: "/section-active.svg",
    },
    {
      id: "content",
      label: "Content",
      src: "/content.svg",
      srcActive: "/content-active.svg",
    },
  ];

  return (
    <div className="border-b">
      <div className="px-[7%]">
        <div className="flex gap-4 md:gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                onTabChange(tab.id as "information" | "section" | "content")
              }
              className={`pb-4 flex items-center gap-2 whitespace-nowrap text-sm md:text-base ${
                activeTab === tab.id
                  ? "text-brand font-medium border-b-2 border-brand"
                  : "text-gray-500"
              }`}
            >
              <img
                src={activeTab === tab.id ? tab.srcActive : tab.src}
                alt=""
                className="w-4 h-4"
              />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
