"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
  className?: string
}

export function FileUpload({
  onUpload,
  maxFiles = 5,
  maxSize = 1048576, // 1MB default
  accept,
  className
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const validateFiles = (files: File[]): File[] => {
    return files.filter(file => {
      // Kiểm tra kích thước file
      if (file.size > maxSize) {
        console.warn(`File "${file.name}" vượt quá kích thước tối đa cho phép.`)
        return false
      }

      // Kiểm tra định dạng file nếu có yêu cầu
      if (accept) {
        const fileType = file.type
        const validType = Object.keys(accept).some(type => {
          // Kiểm tra mime type
          if (fileType === type) return true
          
          // Kiểm tra phần mở rộng
          const extensions = accept[type]
          return extensions.some(ext => 
            file.name.toLowerCase().endsWith(ext.toLowerCase())
          )
        })

        if (!validType) {
          console.warn(`File "${file.name}" không đúng định dạng cho phép.`)
          return false
        }
      }

      return true
    })
  }

  const processFiles = (fileList: FileList) => {
    const files = Array.from(fileList)
    const validFiles = validateFiles(files).slice(0, maxFiles)
    
    if (validFiles.length > 0) {
      onUpload(validFiles)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      // Reset file input để có thể chọn lại cùng một file nếu cần
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Tạo accept string cho input
  const acceptString = accept 
    ? Object.entries(accept)
        .flatMap(([type, extensions]) => [type, ...extensions])
        .join(',')
    : undefined

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 transition-colors flex flex-col items-center justify-center",
        isDragging 
          ? "border-primary bg-primary/5" 
          : "border-muted-foreground/20 hover:border-primary/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple={maxFiles > 1}
        accept={acceptString}
        onChange={handleFileInputChange}
      />
      
      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
      
      <div className="text-center space-y-2">
        <p className="text-sm font-medium">
          Kéo và thả file vào đây, hoặc {" "}
          <button
            type="button"
            className="text-primary hover:underline focus:outline-none"
            onClick={handleButtonClick}
          >
            chọn file
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Tối đa {maxFiles} file{maxFiles > 1 ? "s" : ""} (tối đa {Math.round(maxSize / 1024 / 1024)} MB mỗi file)
        </p>
      </div>
    </div>
  )
} 