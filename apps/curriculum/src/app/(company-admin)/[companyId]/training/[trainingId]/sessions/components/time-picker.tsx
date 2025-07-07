"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function TimePicker({ value, onChange, disabled = false, placeholder = "Select time", className }: TimePickerProps) {
  const [hours, setHours] = useState("09")
  const [minutes, setMinutes] = useState("00")
  
  // Parse the value into hours and minutes when it changes
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':')
      setHours(h.padStart(2, '0'))
      setMinutes(m.padStart(2, '0'))
    }
  }, [value])

  // Generate time options
  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minuteOptions = ['00', '15', '30', '45']

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    const timeString = `${newHours}:${newMinutes}`
    onChange(timeString)
    setHours(newHours)
    setMinutes(newMinutes)
  }

  const formatDisplayTime = (timeString: string) => {
    if (!timeString || !timeString.includes(':')) return placeholder
    
    const [h, m] = timeString.split(':')
    const hour = parseInt(h)
    const minute = m
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    
    return `${displayHour}:${minute} ${ampm}`
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Clock className="h-4 w-4 text-gray-400" />
      
      {/* Hours */}
      <div className="flex flex-col">
        <Select
          value={hours}
          onValueChange={(value) => handleTimeChange(value, minutes)}
          disabled={disabled}
        >
          <SelectTrigger className="w-16 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {hourOptions.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm font-medium">:</div>

      {/* Minutes */}
      <div className="flex flex-col">
        <Select
          value={minutes}
          onValueChange={(value) => handleTimeChange(hours, value)}
          disabled={disabled}
        >
          <SelectTrigger className="w-16 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {minuteOptions.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-gray-500 ml-2">
        {formatDisplayTime(value)}
      </div>
    </div>
  )
} 