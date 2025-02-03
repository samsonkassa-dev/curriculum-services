'use client'

import { FileText, ImageIcon } from "lucide-react"

interface FileIconProps {
  extension?: string
}

export function FileIcon({ extension }: FileIconProps) {
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')

  if (isImage) {
    return <ImageIcon className="w-5 h-5 text-gray-500" />
  }

  return <FileText className="w-5 h-5 text-gray-500" />
} 