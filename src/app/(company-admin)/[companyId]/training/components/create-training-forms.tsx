/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateTraining } from '@/lib/hooks/useCreateTraining'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

interface StepProps {
  onNext: (data: any) => void;
  onBack?: () => void;
}

interface City {
  id: string;
  name: string;
}

// Step 1: Title
export function CreateTrainingStep1({ onNext }: StepProps) {
  const [title, setTitle] = useState('')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-center">
          What is the title of the training
        </h2>
        <p className="text-gray-500 text-sm text-center">
          Enter brief description about this question here
        </p>
      </div>

      <div className="flex flex-col max-w-xl mx-auto space-y-10 justify-center">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter training title"
          className="max-w-xl"
        />

        <Button 
          onClick={() => onNext({ title })}
          className="bg-blue-500 text-white px-8 w-[25%] mx-auto"
          disabled={!title.trim()}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

// Step 2: Location
export function CreateTrainingStep2({ onNext, onBack }: StepProps) {
  const { cities } = useCreateTraining()
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [openCities, setOpenCities] = useState(false)

  const countries = ['Ethiopia', 'Kenya', 'Egypt', 'South Africa']

  const handleSelectCity = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Where will the training take place?
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          Enter brief description about this question here
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedCountry || "Select country..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country}
                      value={country}
                      onSelect={(currentValue) => {
                        setSelectedCountry(currentValue === selectedCountry ? '' : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCountry === country ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {country}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">City</label>
          <Popover open={openCities} onOpenChange={setOpenCities}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCities}
                className="w-full justify-between"
              >
                <div className="flex flex-wrap gap-1">
                  {selectedCities.length > 0 ? (
                    selectedCities.map(city => (
                      <Badge key={city} variant="pending">
                        {city}
                      </Badge>
                    ))
                  ) : (
                    "Select cities..."
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search cities..." />
                <CommandEmpty>No city found.</CommandEmpty>
                <CommandGroup>
                  {(cities || [])?.map((city: City) => (
                    <CommandItem
                      key={city.id}
                      onSelect={() => handleSelectCity(city.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCities.includes(city.name) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {city.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-between pt-8">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button 
            onClick={() => onNext({ 
              cityIds: selectedCities,
            })}
            className="bg-blue-500 text-white px-8"
            disabled={!selectedCities.length || !selectedCountry}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

// Continue with remaining steps...
