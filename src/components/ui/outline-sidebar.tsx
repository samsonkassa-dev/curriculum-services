"use client"

interface OutlineItem {
  label: string
  isCompleted: boolean
}

interface OutlineSidebarProps {
  title: string
  items: OutlineItem[]
  activeItem?: string
  onItemClick?: (label: string) => void
}

export function OutlineSidebar({ title, items, activeItem, onItemClick }: OutlineSidebarProps) {
  return (
    <div className="w-[300px]  p-6 rounded-lg">
      <h2 className="text-brand text-lg font-medium mb-6">{title}</h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.label}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onItemClick?.(item.label)}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center
              ${item.isCompleted ? 'bg-[#E7F6EC]' : 'bg-gray-100'}`}
            >
              {item.isCompleted && (
                <img src="/modalRight.svg" alt="completed" className="w-8 h-8" />
              )}
            </div>
            <span className={`text-sm ${activeItem === item.label ? 'text-brand font-medium' : 'text-gray-600'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 