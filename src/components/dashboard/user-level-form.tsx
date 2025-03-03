"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Định nghĩa interface cho cấp độ người dùng
interface UserLevel {
  id: number
  name: string
  level: number
  requiredExp: number
  benefits: string[]
  color: string
  icon: string
}

interface UserLevelFormProps {
  initialData: UserLevel | null
  onSubmit: (data: UserLevel) => void
}

export function UserLevelForm({ initialData, onSubmit }: UserLevelFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<UserLevel>({
    id: initialData?.id || 0,
    name: initialData?.name || "",
    level: initialData?.level || 1,
    requiredExp: initialData?.requiredExp || 0,
    benefits: initialData?.benefits || [],
    color: initialData?.color || "gray",
    icon: initialData?.icon || "user"
  })
  const [newBenefit, setNewBenefit] = useState("")

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: parseInt(value) || 0 })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleAddBenefit = () => {
    if (newBenefit.trim() !== "") {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, newBenefit.trim()]
      })
      setNewBenefit("")
    }
  }

  const handleRemoveBenefit = (index: number) => {
    const updatedBenefits = [...formData.benefits]
    updatedBenefits.splice(index, 1)
    setFormData({ ...formData, benefits: updatedBenefits })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên cấp độ",
        variant: "destructive"
      })
      return
    }

    onSubmit(formData)
    toast({
      title: "Thành công",
      description: `Đã ${initialData ? "cập nhật" : "thêm"} cấp độ người dùng`,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên cấp độ</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên cấp độ"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Cấp độ</Label>
          <Input
            id="level"
            name="level"
            type="number"
            min="1"
            max="100"
            value={formData.level}
            onChange={handleNumberChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requiredExp">Kinh nghiệm yêu cầu</Label>
        <Input
          id="requiredExp"
          name="requiredExp"
          type="number"
          min="0"
          value={formData.requiredExp}
          onChange={handleNumberChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Màu sắc</Label>
          <Select
            value={formData.color}
            onValueChange={(value) => handleSelectChange("color", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn màu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gray">Xám</SelectItem>
              <SelectItem value="green">Xanh lá</SelectItem>
              <SelectItem value="blue">Xanh dương</SelectItem>
              <SelectItem value="purple">Tím</SelectItem>
              <SelectItem value="orange">Cam</SelectItem>
              <SelectItem value="red">Đỏ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">Biểu tượng</Label>
          <Select
            value={formData.icon}
            onValueChange={(value) => handleSelectChange("icon", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn biểu tượng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Người dùng</SelectItem>
              <SelectItem value="book-open">Sách mở</SelectItem>
              <SelectItem value="bookmark">Đánh dấu</SelectItem>
              <SelectItem value="award">Giải thưởng</SelectItem>
              <SelectItem value="star">Ngôi sao</SelectItem>
              <SelectItem value="crown">Vương miện</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Đặc quyền</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.benefits.map((benefit, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {benefit}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full"
                onClick={() => handleRemoveBenefit(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            placeholder="Thêm đặc quyền mới"
          />
          <Button
            type="button"
            onClick={handleAddBenefit}
            size="sm"
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Thêm
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit">
          {initialData ? "Cập nhật" : "Thêm"} cấp độ
        </Button>
      </div>
    </form>
  )
} 