"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload } from "@/components/ui/file-upload"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"

const commonGenres = [
  "Tiên Hiệp", "Kiếm Hiệp", "Ngôn Tình", "Đô Thị", "Huyền Huyễn", 
  "Khoa Huyễn", "Kỳ Ảo", "Lịch Sử", "Võng Du", "Đồng Nhân",
  "Huyền Nghi", "Trinh Thám", "Kinh Dị", "Truyện Teen", "Quân Sự"
]

export interface AuthorRequestFormValues {
  bio: string
  experience: string
  genres: string[]
  samples: File[]
}

interface AuthorRequestFormProps {
  onSubmit: (values: AuthorRequestFormValues) => void
  isPending?: boolean
}

export function AuthorRequestForm({
  onSubmit,
  isPending = false
}: AuthorRequestFormProps) {
  const [formData, setFormData] = useState<AuthorRequestFormValues>({
    bio: "",
    experience: "",
    genres: [],
    samples: []
  })
  const [newGenre, setNewGenre] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Xóa lỗi nếu trường đã được điền
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      })
    }
  }

  const handleGenreSelect = (value: string) => {
    if (!formData.genres.includes(value)) {
      setFormData({
        ...formData,
        genres: [...formData.genres, value]
      })
      // Xóa lỗi nếu đã chọn thể loại
      if (errors.genres) {
        setErrors({
          ...errors,
          genres: ""
        })
      }
    }
  }

  const handleAddCustomGenre = () => {
    if (newGenre.trim() && !formData.genres.includes(newGenre.trim())) {
      setFormData({
        ...formData,
        genres: [...formData.genres, newGenre.trim()]
      })
      setNewGenre("")
      // Xóa lỗi nếu đã chọn thể loại
      if (errors.genres) {
        setErrors({
          ...errors,
          genres: ""
        })
      }
    }
  }

  const handleRemoveGenre = (genre: string) => {
    setFormData({
      ...formData,
      genres: formData.genres.filter(g => g !== genre)
    })
  }

  const handleFileUpload = (files: File[]) => {
    setFormData({
      ...formData,
      samples: [...formData.samples, ...files]
    })
    // Xóa lỗi nếu đã tải lên mẫu truyện
    if (errors.samples) {
      setErrors({
        ...errors,
        samples: ""
      })
    }
  }

  const handleRemoveFile = (index: number) => {
    setFormData({
      ...formData,
      samples: formData.samples.filter((_, i) => i !== index)
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.bio.trim()) {
      newErrors.bio = "Vui lòng nhập tiểu sử của bạn"
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = "Vui lòng nhập kinh nghiệm viết lách của bạn"
    }
    
    if (formData.genres.length === 0) {
      newErrors.genres = "Vui lòng chọn ít nhất một thể loại"
    }
    
    if (formData.samples.length === 0) {
      newErrors.samples = "Vui lòng tải lên ít nhất một mẫu truyện"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
      toast.success("Yêu cầu của bạn đã được gửi đi thành công!")
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Đăng ký trở thành tác giả</CardTitle>
        <CardDescription>
          Điền thông tin dưới đây để gửi yêu cầu trở thành tác giả trên nền tảng của chúng tôi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Tiểu sử <span className="text-red-500">*</span></Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Giới thiệu bản thân và niềm đam mê viết lách của bạn..."
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className={errors.bio ? "border-red-500" : ""}
            />
            {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Kinh nghiệm viết lách <span className="text-red-500">*</span></Label>
            <Textarea
              id="experience"
              name="experience"
              placeholder="Mô tả kinh nghiệm viết lách của bạn, các tác phẩm đã xuất bản (nếu có)..."
              rows={4}
              value={formData.experience}
              onChange={handleChange}
              className={errors.experience ? "border-red-500" : ""}
            />
            {errors.experience && <p className="text-sm text-red-500">{errors.experience}</p>}
          </div>

          <div className="space-y-4">
            <Label>Thể loại chuyên viết <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.genres.map((genre, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {genre}
                  <button
                    type="button"
                    onClick={() => handleRemoveGenre(genre)}
                    className="rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select onValueChange={handleGenreSelect}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chọn thể loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {commonGenres.map((genre) => (
                      <SelectItem key={genre} value={genre} disabled={formData.genres.includes(genre)}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="flex flex-1 gap-2">
                <Input
                  placeholder="Hoặc nhập thể loại khác"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomGenre()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddCustomGenre}>Thêm</Button>
              </div>
            </div>
            {errors.genres && <p className="text-sm text-red-500">{errors.genres}</p>}
          </div>

          <div className="space-y-4">
            <Label>Mẫu tác phẩm <span className="text-red-500">*</span></Label>
            <p className="text-sm text-muted-foreground">
              Tải lên một số mẫu truyện của bạn (tối đa 3 file, định dạng .docx, .pdf hoặc .txt)
            </p>
            <FileUpload
              onUpload={handleFileUpload}
              maxFiles={3}
              maxSize={5242880} // 5MB
              accept={{
                'application/pdf': ['.pdf'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'text/plain': ['.txt']
              }}
              className={errors.samples ? "border-red-500" : ""}
            />
            {errors.samples && <p className="text-sm text-red-500">{errors.samples}</p>}
            
            {formData.samples.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label>Các file đã tải lên:</Label>
                <div className="space-y-2">
                  {formData.samples.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({Math.round(file.size / 1024)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Hủy bỏ</Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? "Đang gửi..." : "Gửi yêu cầu"}
        </Button>
      </CardFooter>
    </Card>
  )
} 