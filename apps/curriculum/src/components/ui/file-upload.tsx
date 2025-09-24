import { Button } from "./button"
import { ChangeEvent, useRef } from "react"

interface FileUploadProps {
  accept?: string
  onChange: (file: File | null) => void
  variant?: 'button' | 'icon'
  size?: 'sm' | 'md' | 'lg'
}

export function FileUpload({ accept, onChange, variant = 'button', size = 'md' }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onChange(file)
  }

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  const containerSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
        title="file upload"
      />
      
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`${containerSizes[size]} rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors hover:bg-gray-50 cursor-pointer`}
          title="Add Image"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/addImage.svg" 
            alt="Add Image" 
            className={iconSizes[size]}
          />
        </button>
      ) : (
        <Button
          variant="outline"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex gap-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/addImage.svg" 
            alt="Add Image" 
            className="w-4 h-4"
          />
          Add Image
        </Button>
      )}
    </>
  )
} 