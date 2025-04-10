"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useNovels } from "@/hooks/use-novels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

// Mảng thể loại tiểu thuyết mẫu
const novelCategories = [
  { id: "1", name: "Tiên Hiệp" },
  { id: "2", name: "Kiếm Hiệp" },
  { id: "3", name: "Ngôn Tình" },
  { id: "4", name: "Đô Thị" },
  { id: "5", name: "Huyền Huyễn" },
  { id: "6", name: "Dị Giới" },
  { id: "7", name: "Khoa Huyễn" },
  { id: "8", name: "Kỳ Ảo" },
  { id: "9", name: "Võng Du" },
  { id: "10", name: "Lịch Sử" },
  { id: "11", name: "Quân Sự" },
  { id: "12", name: "Trinh Thám" },
  { id: "13", name: "Xuyên Không" },
  { id: "14", name: "Trọng Sinh" },
  { id: "15", name: "Mạt Thế" },
  { id: "16", name: "Cổ Đại" },
  { id: "17", name: "Hiện Đại" },
  { id: "18", name: "Huyền Nghi" },
]

export default function EditNovelPage({ params }: { params: { novelId: string } }) {
  const router = useRouter()
  const { novel, fetchNovel, updateNovel, isLoading } = useNovels()
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "ongoing",
    imageUrl: "",
    idCategories: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)

  // Tải thông tin tiểu thuyết khi trang được tải
  useEffect(() => {
    async function loadNovel() {
      if (params.novelId) {
        await fetchNovel(params.novelId)
      }
    }
    loadNovel()
  }, [fetchNovel, params.novelId])

  // Cập nhật form khi novel được tải
  useEffect(() => {
    if (novel) {
      const categoryIds = Array.isArray(novel.idCategories) 
        ? novel.idCategories.map(cat => typeof cat === 'object' ? cat._id : cat) 
        : []

      setForm({
        title: novel.title || '',
        description: novel.description || '',
        status: novel.status || 'ongoing',
        imageUrl: novel.imageUrl || '',
        idCategories: categoryIds,
      })
    }
  }, [novel])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (categoryId: string) => {
    setForm(prev => {
      const categories = [...prev.idCategories]
      const index = categories.indexOf(categoryId)
      
      if (index === -1) {
        categories.push(categoryId)
      } else {
        categories.splice(index, 1)
      }
      
      return { ...prev, idCategories: categories }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề")
      return
    }
    
    try {
      setSubmitting(true)
      
      const updatedData = {
        title: form.title,
        description: form.description,
        status: form.status,
        imageUrl: form.imageUrl,
        idCategories: form.idCategories,
      }
      
      const result = await updateNovel(params.novelId, updatedData)
      
      if (result) {
        toast.success("Cập nhật tiểu thuyết thành công")
        router.push(`/dashboard/novels/${params.novelId}`)
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật tiểu thuyết:", error)
      toast.error("Đã xảy ra lỗi khi cập nhật tiểu thuyết")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Đang tải thông tin tiểu thuyết...</p>
      </div>
    )
  }

  if (!novel && !isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-xl">Không tìm thấy thông tin tiểu thuyết</p>
        <Button onClick={() => router.push('/dashboard/novels')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Chỉnh sửa tiểu thuyết</h2>
        <Button variant="outline" onClick={() => router.push(`/dashboard/novels/${params.novelId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại chi tiết
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Cập nhật thông tin cơ bản của tiểu thuyết
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề tiểu thuyết"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả tiểu thuyết"
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Đang cập nhật</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image-url">URL ảnh bìa</Label>
                  <Input
                    id="image-url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleInputChange}
                    placeholder="URL ảnh bìa tiểu thuyết"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thể loại</CardTitle>
              <CardDescription>
                Chọn thể loại cho tiểu thuyết (có thể chọn nhiều)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {novelCategories.map((category) => {
                  const isSelected = form.idCategories.includes(category.id)
                  return (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {category.name}
                    </div>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
} 