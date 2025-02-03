/* eslint-disable @next/next/no-img-element */
'use client'

import { ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useMemo } from "react"
import { ImageDialog, ImageDialogContent } from "@/components/ui/image-dialog"

interface FilePreviewProps {
  fileUrl: string
  fileName: string
}

export function FilePreview({ fileUrl, fileName }: FilePreviewProps) {
  const [showImageModal, setShowImageModal] = useState(false)
  
  const isImage = useMemo(() => {
    // Check file extension
    const fileExtension = fileUrl.split('.').pop()?.toLowerCase()
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
    
    // Check if URL contains image indicators
    const hasImageIndicator = fileUrl.includes('/image/') || fileUrl.includes('images/')
    
    return imageExtensions.includes(fileExtension || '') || hasImageIndicator
  }, [fileUrl])

 // const fileSize = '67KB'

  if (isImage) {
    return (
      <>
        <button
          onClick={() => setShowImageModal(true)}
          className="flex items-center gap-2 hover:bg-gray-50 w-full"
        >
          <ImageIcon className="w-5 h-5 text-gray-500" />
          <div className="flex flex-1 items-center gap-1">
            <p className="text-gray-600">{fileName}</p>
          </div>
        </button>

        <ImageDialog open={showImageModal} onOpenChange={setShowImageModal}>
          <ImageDialogContent className="max-w-4xl overflow-hidden bg-white rounded-lg">
            <img 
              src={fileUrl} 
              alt={fileName}
              className="w-full h-auto"
            />
          </ImageDialogContent>
        </ImageDialog>
      </>
    )
  }

  return (
    <Link 
      href={fileUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:bg-gray-50 w-[10%] px-2"
    >
      <Image src="/fileC.svg" alt="File icon" width={15} height={15} className="text-gray-500" />
      <div className="flex flex-1 items-center gap-1">
        <p className="text-[#787878]">{fileName}</p>
        {/* <p className="text-sm text-gray-400 ">({fileSize})</p> */}
      </div>
    </Link>
  )
} 