"use client"

interface EditFormContainerProps {
  title: string
  description: string
  children: React.ReactNode
}

export function EditFormContainer({ title, description, children }: EditFormContainerProps) {
  return (
    <div className="flex-1 rounded-lg p-2">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-[#99948E] text-sm mb-4">{description}</p>
        
        {children}
      </div>
    </div>
  )
} 