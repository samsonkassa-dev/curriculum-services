"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Filter, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

export interface CohortFilters {
  name?: string
  tags?: string[]
  createdAtFrom?: Date
  createdAtTo?: Date
}

interface CohortFilterProps {
  filters: CohortFilters
  onFiltersChange: (filters: CohortFilters) => void
  availableTags?: string[]
}

export function CohortFilter({ filters, onFiltersChange, availableTags = [] }: CohortFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<CohortFilters>(filters)

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    const emptyFilters: CohortFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  const handleTagToggle = (tag: string) => {
    const currentTags = localFilters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    setLocalFilters({ ...localFilters, tags: newTags.length > 0 ? newTags : undefined })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-10 relative"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#0B75FF] text-white text-xs rounded-full flex items-center justify-center">
              {Object.keys(filters).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter Cohorts</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          {/* Name Filter */}
          <div className="space-y-2">
            <Label htmlFor="filter-name" className="text-xs font-medium">
              Cohort Name
            </Label>
            <Input
              id="filter-name"
              placeholder="Enter cohort name..."
              value={localFilters.name || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, name: e.target.value || undefined })
              }
              className="h-9 text-sm"
            />
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Tags</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => {
                  const isSelected = localFilters.tags?.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-[#0B75FF] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Created Date Range */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Created Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="date-from" className="text-xs text-gray-500">
                  From
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-9 text-xs justify-start text-left font-normal"
                    >
                      {localFilters.createdAtFrom
                        ? localFilters.createdAtFrom.toLocaleDateString()
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.createdAtFrom}
                      onSelect={(date) =>
                        setLocalFilters({ ...localFilters, createdAtFrom: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <Label htmlFor="date-to" className="text-xs text-gray-500">
                  To
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-9 text-xs justify-start text-left font-normal"
                    >
                      {localFilters.createdAtTo
                        ? localFilters.createdAtTo.toLocaleDateString()
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.createdAtTo}
                      onSelect={(date) =>
                        setLocalFilters({ ...localFilters, createdAtTo: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFilters}
              className="flex-1 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

