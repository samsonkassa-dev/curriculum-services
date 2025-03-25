/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"



interface FilterProps {
  statusOptions?: { id: string; label: string }[]
  attributeOptions?: { id: string; label: string }[]
  onApply: (filters: {
    selectedAttributes: string[]
    selectedStatus?: string
  }) => void
  defaultSelected?: {
    attributes?: string[]
    status?: string
  }
}

export function Filter({
  statusOptions = [],
  attributeOptions = [],
  onApply,
  defaultSelected = {},
}: FilterProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<string | undefined>(
    defaultSelected.status
  )

  const [selectedAttributes, setSelectedAttributes] = React.useState<string[]>(
    defaultSelected.attributes || []
  )
  
  const [open, setOpen] = React.useState(false)

  const handleApply = () => {
    onApply({
      selectedAttributes,
      selectedStatus,
    })
    setOpen(false)
  }

  const handleAttributeToggle = (checked: boolean, id: string) => {
    setSelectedAttributes(prev =>
      checked ? [...prev, id] : prev.filter(item => item !== id)
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="h-10 px-4 border-gray-200 rounded-lg font-normal text-sm"
        >
          <Image
            src="/filter.svg"
            alt="Filter"
            width={19}
            height={19}
            className="h-4 w-4 mr-2"
          />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-6" 
        align="end" 
        alignOffset={-40}
        sideOffset={8}
      >
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Filter</h3>
          
          {attributeOptions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Filter Type</h4>
              <div className="grid grid-cols-2 gap-4">
                {attributeOptions.map((attribute) => (
                  <div key={attribute.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={attribute.id}
                      checked={selectedAttributes.includes(attribute.id)}
                      onCheckedChange={(checked) => 
                        handleAttributeToggle(checked as boolean, attribute.id)
                      }
                      className="h-5 w-5 rounded-[4px] border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label 
                      htmlFor={attribute.id}
                      className="text-base font-normal"
                    >
                      {attribute.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statusOptions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Select Status</h4>
              <div className="grid grid-cols-2 gap-4">
                {statusOptions.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={status.id}
                      checked={selectedStatus === status.id}
                      onCheckedChange={(checked) => {
                        setSelectedStatus(checked ? status.id : undefined)
                      }}
                      className="h-5 w-5 rounded-[4px] border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label 
                      htmlFor={status.id}
                      className="text-base font-normal"
                    >
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between gap-4 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-200"
              onClick={() => {
                setSelectedAttributes([])
                setSelectedStatus(undefined)
                handleApply()
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-brand text-white hover:bg-blue-600"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
