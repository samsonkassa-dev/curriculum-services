"use client"

interface OutlineItem {
  label: string
  isCompleted: boolean
}

interface OutlineGroup {
  title?: string
  items: OutlineItem[]
}

interface OutlineSidebarProps {
  title: string
  groups: OutlineGroup[]
  activeItem?: string
  onItemClick?: (label: string) => void
}

export function OutlineSidebar({ title, groups, activeItem, onItemClick }: OutlineSidebarProps) {
  return (
    <div className="w-[330px] p-6 rounded-lg">
      <h2 className="text-brand text-[16px] font-semibold mb-6 px-3">{title}</h2>
      
      <div className="space-y-6">
        {groups.map((group, index) => (
          <div key={index} className="space-y-4">
            {group.title && (
              <h3 className="text-[#333333] text-[16px] font-medium px-3">
                {group.title}
              </h3>
            )}
            
            <div className="space-y-4">
              {group.items.map((item) => (
                <div 
                  key={item.label}
                  className={`flex items-center px-3 gap-3 cursor-pointer ${
                    activeItem === item.label 
                      ? 'bg-[#EBF3FF] px-2 py-2 border-l-4 border-blue-500' 
                      : ''
                  }`}
                  onClick={() => onItemClick?.(item.label)}
                >
                  <div className={`w-6 h-5 border-[#444444] border-[0.88px] rounded-full flex items-center justify-center
                    ${item.isCompleted ? 'bg-[#E7F6EC]' : 'bg-gray-100'}`}
                  >
                    {item.isCompleted && (
                      <img src="/modalRight.svg" alt="completed" className="w-8 h-8" />
                    )}
                  </div>
                  <span className={`text-[13px] w-full font-light ${
                    activeItem === item.label ? 'text-black' : 'text-black'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 