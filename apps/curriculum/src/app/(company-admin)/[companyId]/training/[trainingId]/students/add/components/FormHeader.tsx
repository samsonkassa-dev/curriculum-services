import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormHeaderProps {
  onCancel: () => void
  isEditing?: boolean
}

export function FormHeader({ onCancel, isEditing = false }: FormHeaderProps) {
  return (
    <div className="flex flex-col mb-6">
      <div className="self-end">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="text-gray-500"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <h2 className="text-xl font-semibold pb-3">
        {isEditing ? "Edit Student" : "Add New Student"}
      </h2>
      
      {/* Tabs */}
      <div className="w-full border-b border-gray-200 mb-4">
        <div className="flex gap-3">
          <Button 
            variant="link"
            className={cn(
              "pb-3 px-4 border-b-2 rounded-none", 
              "border-blue-500 text-blue-500 font-semibold"
            )}
          >
            Manually
          </Button>
          <Button 
            variant="link"
            className={cn(
              "pb-3 px-4 border-b-2 rounded-none text-gray-600", 
              "border-transparent"
            )}
            disabled
          >
            Import CSV
          </Button>
        </div>
      </div>
    </div>
  )
} 