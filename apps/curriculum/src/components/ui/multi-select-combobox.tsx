"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  noResultsText?: string
  className?: string
  disabled?: boolean
  maxDisplayItems?: number // Max number of items to show before collapsing to "X more"
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  noResultsText = "No options found.",
  className,
  disabled = false,
  maxDisplayItems = 2,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const selectedLabels = selected
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter(Boolean) as string[]

  // Determine what to display based on number of selected items
  const getDisplayContent = () => {
    if (selectedLabels.length === 0) {
      return <span className="text-muted-foreground text-sm">{placeholder}</span>
    }
    
    if (selectedLabels.length <= maxDisplayItems) {
      // Show all items as badges
      return selectedLabels.map((label) => (
        <Badge
          variant="deactivated"
          key={label}
          className="mr-1 mb-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            const valueToRemove = options.find(opt => opt.label === label)?.value;
            if (valueToRemove) handleRemove(valueToRemove);
          }}
        >
          {label}
          <X className="ml-1 h-3 w-3 cursor-pointer" />
        </Badge>
      ))
    } else {
      // Show first item and "X more" text
      const firstLabel = selectedLabels[0]
      const remainingCount = selectedLabels.length - 1
      
      return (
        <div className="flex items-center gap-1 flex-wrap">
          <Badge
            variant="deactivated"
            className="mr-1 mb-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              const valueToRemove = options.find(opt => opt.label === firstLabel)?.value;
              if (valueToRemove) handleRemove(valueToRemove);
            }}
          >
            {firstLabel}
            <X className="ml-1 h-3 w-3 cursor-pointer" />
          </Badge>
          <span className="text-sm text-muted-foreground">
            and {remainingCount} more selected
          </span>
        </div>
      )
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10", className)} // Ensure height adjusts
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap flex-1 min-w-0">
            {getDisplayContent()}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{noResultsText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Use label for search filtering
                  onSelect={() => handleSelect(option.value)}
                  disabled={disabled}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 