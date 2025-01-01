'use client'

import { FileUpload } from "@/components/ui/file-upload"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CompanyFileType, CompanyFileUpload, CompanyProfileFormData } from "@/types/company"
import { UseFormSetValue, UseFormWatch } from "react-hook-form"

interface FileUploadSectionProps {
  setValue: UseFormSetValue<CompanyProfileFormData>
  watch: UseFormWatch<CompanyProfileFormData>
  fileTypes: CompanyFileType[]
}

export function FileUploadSection({ setValue, watch, fileTypes }: FileUploadSectionProps) {
  const fileType = watch('fileType')

  const handleFileChange = (file: File | null) => {
    if (file && fileType) {
      const currentFiles = watch('companyFiles') || []
      setValue('companyFiles', [
        ...currentFiles,
        { fileTypeId: fileType, file } as CompanyFileUpload
      ])
    }
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="companyFiles">Company Files</Label>
      <p className="text-sm text-gray-500">Upload your company documents and logo</p>
      <div className="flex gap-2">
        <Select 
          onValueChange={(value) => {
            const selected = fileTypes.find(type => type.id === value)
            if (selected) {
              setValue('fileType', selected.id)
            }
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select file type" />
          </SelectTrigger>
          <SelectContent>
            {fileTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <FileUpload
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />
      </div>

      {/* Display uploaded files */}
      {watch('companyFiles')?.map((file: CompanyFileUpload, index: number) => (
        <div key={index} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-10 h-10 bg-white border rounded">
              <img src="/icons/file-document.svg" alt="File" width={20} height={20} />
            </div>
            <div>
              <p className="font-medium text-sm">{file.file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.file.size / 1024).toFixed(1)}KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const files = watch('companyFiles')?.filter((_, i) => i !== index)
              setValue('companyFiles', files)
            }}
            className="text-gray-500 hover:text-red-500"
          >
            <img src="/dialogdelete.svg" alt="Remove" width={24} height={24} />
          </Button>
        </div>
      ))}
    </div>
  )
} 