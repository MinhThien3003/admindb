"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign, Lock, Unlock } from "lucide-react"

interface ChapterPriceFormProps {
  chapterId: number
  chapterTitle: string
  novelTitle: string
  isPremium: boolean
  currentPrice: number
  onSave: (chapterId: number, isPremium: boolean, price: number) => void
  onCancel: () => void
}

export function ChapterPriceForm({
  chapterId,
  chapterTitle,
  novelTitle,
  isPremium,
  currentPrice,
  onSave,
  onCancel
}: ChapterPriceFormProps) {
  const [price, setPrice] = useState(currentPrice)
  const [premium, setPremium] = useState(isPremium)
  const [pricePreset, setPricePreset] = useState<string>("custom")

  // Các mức giá preset
  const pricePresets = [
    { value: "5000", label: "5,000đ" },
    { value: "10000", label: "10,000đ" },
    { value: "15000", label: "15,000đ" },
    { value: "20000", label: "20,000đ" },
    { value: "25000", label: "25,000đ" },
    { value: "30000", label: "30,000đ" },
    { value: "custom", label: "Tùy chỉnh" }
  ]

  // Xử lý khi chọn mức giá preset
  const handlePresetChange = (value: string) => {
    setPricePreset(value)
    if (value !== "custom") {
      setPrice(parseInt(value))
    }
  }

  // Xử lý khi thay đổi giá tiền
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value) || 0
    setPrice(newPrice)
    setPricePreset("custom")
  }

  // Xử lý khi thay đổi trạng thái premium
  const handlePremiumChange = (checked: boolean) => {
    setPremium(checked)
    if (!checked) {
      setPrice(0)
    } else if (price === 0) {
      setPrice(15000) // Giá mặc định khi bật premium
      setPricePreset("15000")
    }
  }

  // Xử lý khi lưu
  const handleSave = () => {
    onSave(chapterId, premium, premium ? price : 0)
  }

  // Định dạng số tiền
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Chỉnh sửa giá chương</h3>
        <p className="text-sm text-muted-foreground">
          Truyện: <span className="font-medium">{novelTitle}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Chương: <span className="font-medium">{chapterTitle}</span>
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="premium-mode"
          checked={premium}
          onCheckedChange={handlePremiumChange}
        />
        <Label htmlFor="premium-mode" className="flex items-center cursor-pointer">
          {premium ? (
            <>
              <Lock className="h-4 w-4 mr-2 text-orange-500" />
              <span>Chương premium</span>
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4 mr-2 text-green-500" />
              <span>Chương miễn phí</span>
            </>
          )}
        </Label>
      </div>

      {premium && (
        <>
          <div className="space-y-2">
            <Label htmlFor="price-preset">Mức giá</Label>
            <Select
              value={pricePreset}
              onValueChange={handlePresetChange}
              disabled={!premium}
            >
              <SelectTrigger id="price-preset">
                <SelectValue placeholder="Chọn mức giá" />
              </SelectTrigger>
              <SelectContent>
                {pricePresets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-price">Giá tùy chỉnh</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="custom-price"
                type="number"
                min="1000"
                step="1000"
                value={price}
                onChange={handlePriceChange}
                className="pl-8"
                disabled={!premium}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Giá hiển thị: <span className="font-medium">{formatCurrency(price)}</span>
            </p>
            <div className="text-xs text-muted-foreground">
              <p>Phân chia doanh thu:</p>
              <p>- Tác giả: {formatCurrency(price * 0.7)} (70%)</p>
              <p>- Nền tảng: {formatCurrency(price * 0.3)} (30%)</p>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={handleSave}>
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
} 