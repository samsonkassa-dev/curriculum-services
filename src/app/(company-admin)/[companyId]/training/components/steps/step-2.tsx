"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { useBaseData } from '@/lib/hooks/useBaseData'
import { useCities } from '@/lib/hooks/useCities'
import { StepProps } from '../types'

interface Country {
  id: string;
  name: string;
  description: string;
}

interface City {
  id: string;
  name: string;
  description: string;
  country: Country;
}

export function CreateTrainingStep2({ onNext, onBack, initialData }: StepProps) {
  const { data: countries, isLoading: isLoadingCountries } = useBaseData('country')
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>(
    initialData?.countryIds || []
  )
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>(
    initialData?.cityIds || []
  )
  const [open, setOpen] = useState(false)
  const [openCities, setOpenCities] = useState(false)

  const { data: cities, isLoading: isLoadingCities } = useCities(selectedCountryIds)

  const safeCountries = countries || []
  const safeCities = cities || []

  const handleSelectCountry = (countryId: string) => {
    setSelectedCountryIds(prev => {
      const newIds = prev.includes(countryId)
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
      
      if (prev.includes(countryId)) {
        setSelectedCityIds(prevCities => 
          prevCities.filter(cityId => {
            const city = safeCities.find(c => c.id === cityId)
            return city && newIds.includes(city.country.id)
          })
        )
      }
      
      return newIds
    })
  }

  const handleSelectCity = (cityId: string) => {
    setSelectedCityIds(prev => 
      prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="lg:text-2xl md:text-xl text-lg font-semibold mb-2 text-center">
          Where will the training take place?
        </h2>
        <p className="lg:text-sm md:text-xs text-xs text-gray-500 text-center mb-8">
          Enter brief description about this question here
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Countries</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between py-6"
                disabled={isLoadingCountries}
              >
                <div className="flex flex-wrap gap-1">
                  {selectedCountryIds.length > 0 ? (
                    selectedCountryIds.map(countryId => {
                      const countryName = safeCountries.find((c: Country) => c.id === countryId)?.name
                      return (
                        <Badge key={countryId} variant="pending">
                          {countryName}
                        </Badge>
                      )
                    })
                  ) : (
                    "Select countries..."
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-[300px] overflow-auto">
                {safeCountries.map((country: Country) => (
                  <div
                    key={country.id}
                    className={cn(
                      "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100",
                      selectedCountryIds.includes(country.id) && "bg-gray-100"
                    )}
                    onClick={() => handleSelectCountry(country.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCountryIds.includes(country.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {country.name}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cities</label>
          <Popover open={openCities} onOpenChange={setOpenCities}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between py-6"
                disabled={isLoadingCities || !selectedCountryIds.length}
              >
                <div className="flex flex-wrap gap-1">
                  {selectedCityIds.length > 0 ? (
                    selectedCityIds.map(cityId => {
                      const city = safeCities.find(c => c.id === cityId)
                      return (
                        <Badge key={cityId} variant="pending">
                          {city?.name}
                        </Badge>
                      )
                    })
                  ) : (
                    "Select cities..."
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-[300px] overflow-auto">
                {safeCities.map((city) => (
                  <div
                    key={city.id}
                    className={cn(
                      "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100",
                      selectedCityIds.includes(city.id) && "bg-gray-100"
                    )}
                    onClick={() => handleSelectCity(city.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCityIds.includes(city.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {city.name} ({city.country.name})
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-between pt-8">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button 
            onClick={() => onNext({ 
              countryIds: selectedCountryIds,
              cityIds: selectedCityIds 
            })}
            className="bg-blue-500 text-white px-8"
            disabled={!selectedCityIds.length}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
} 