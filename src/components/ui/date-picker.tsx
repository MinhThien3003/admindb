"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { vi } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: boolean
  locale?: Locale
}

export function DatePicker({ selected, onSelect, disabled, locale = vi }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(selected)

  React.useEffect(() => {
    setDate(selected)
  }, [selected])

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate && onSelect) {
      onSelect(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale }) : <span>Chọn ngày</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  )
} 