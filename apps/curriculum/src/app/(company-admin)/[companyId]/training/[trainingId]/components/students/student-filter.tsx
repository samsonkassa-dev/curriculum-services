/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { StudentFilters } from "@/lib/hooks/useStudents"

interface Country {
  id: string
  name: string
  description: string
}

interface Region {
  id: string
  name: string
  description: string
  country: Country
}

interface Zone {
  id: string
  name: string
  description: string
  region: Region
}

interface Language {
  id: string
  name: string
  description: string
}

interface AcademicLevel {
  id: string
  name: string
  description: string
}

interface Disability {
  id: string
  name: string
  description: string
}

interface MarginalizedGroup {
  id: string
  name: string
  description: string
}

interface StudentFilterProps {
  countries?: Country[]
  regions?: Region[]
  zones?: Zone[]
  languages?: Language[]
  academicLevels?: AcademicLevel[]
  // Commented out for now
  // disabilities?: Disability[]
  // marginalizedGroups?: MarginalizedGroup[]
  onApply: (filters: StudentFilters) => void
  defaultSelected?: StudentFilters
}

const genderOptions = [
  { id: "MALE", label: "Male" },
  { id: "FEMALE", label: "Female" }
]

// Commented out for now
// const smartphoneOptions = [
//   { id: "true", label: "Has Smartphone" },
//   { id: "false", label: "No Smartphone" }
// ]

// const trainingExperienceOptions = [
//   { id: "true", label: "Has Training Experience" },
//   { id: "false", label: "No Training Experience" }
// ]

export function StudentFilter({
  countries = [],
  regions = [],
  zones = [],
  languages = [],
  academicLevels = [],
  // Commented out for now
  // disabilities = [],
  // marginalizedGroups = [],
  onApply,
  defaultSelected = {},
}: StudentFilterProps) {
  const [open, setOpen] = useState(false)
  
  // Filter states
  const [selectedGenders, setSelectedGenders] = useState<string[]>(defaultSelected.genders || [])
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>(defaultSelected.languageIds || [])
  const [selectedAcademicLevelIds, setSelectedAcademicLevelIds] = useState<string[]>(defaultSelected.academicLevelIds || [])
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>(defaultSelected.zoneIds || [])
  // Commented out for now
  // const [selectedDisabilityIds, setSelectedDisabilityIds] = useState<string[]>(defaultSelected.disabilityIds || [])
  // const [selectedMarginalizedGroupIds, setSelectedMarginalizedGroupIds] = useState<string[]>(defaultSelected.marginalizedGroupIds || [])
  // const [selectedHasSmartphone, setSelectedHasSmartphone] = useState<boolean | undefined>(defaultSelected.hasSmartphone)
  // const [selectedHasTrainingExperience, setSelectedHasTrainingExperience] = useState<boolean | undefined>(defaultSelected.hasTrainingExperience)

  // Location cascading states
  const [selectedCountryId, setSelectedCountryId] = useState("")
  const [selectedRegionId, setSelectedRegionId] = useState("")

  // Popover states for location selects
  const [openCountries, setOpenCountries] = useState(false)
  const [openRegions, setOpenRegions] = useState(false)
  
  // Search states for location selects
  const [countrySearch, setCountrySearch] = useState('')
  const [regionSearch, setRegionSearch] = useState('')
  
  // Debounced search values
  const debouncedCountrySearch = useDebounce(countrySearch, 300)
  const debouncedRegionSearch = useDebounce(regionSearch, 300)

  // Filter data based on selections (client-side filtering for hierarchical relationships)
  const availableRegions = useMemo(() => {
    if (!selectedCountryId || !regions) return []
    return regions.filter((region: Region) => 
      region.country.id === selectedCountryId
    )
  }, [regions, selectedCountryId])

  const availableZones = useMemo(() => {
    if (!selectedRegionId || !zones) return []
    return zones.filter((zone: Zone) => 
      zone.region.id === selectedRegionId
    )
  }, [zones, selectedRegionId])

  // Filter data based on search
  const filteredCountries = useMemo(() => {
    return countries.filter((country) =>
      country.name.toLowerCase().includes(debouncedCountrySearch.toLowerCase())
    )
  }, [countries, debouncedCountrySearch])
  
  const filteredRegions = useMemo(() => {
    return availableRegions.filter((region) =>
      region.name.toLowerCase().includes(debouncedRegionSearch.toLowerCase())
    )
  }, [availableRegions, debouncedRegionSearch])

  // Handle cascading selection changes
  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId)
    // Clear dependent selections
    setSelectedRegionId("")
    setSelectedZoneIds([])
    setOpenCountries(false)
  }

  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId)
    // Clear dependent selections
    setSelectedZoneIds([])
    setOpenRegions(false)
  }

  // Clear search when popovers close
  const handleCountriesOpenChange = (open: boolean) => {
    setOpenCountries(open)
    if (!open) setCountrySearch('')
  }

  const handleRegionsOpenChange = (open: boolean) => {
    setOpenRegions(open)
    if (!open) setRegionSearch('')
  }

  // Get display names for selected items
  const getSelectedCountryName = () => {
    if (!selectedCountryId || !countries) return ""
    const country = countries.find(c => c.id === selectedCountryId)
    return country?.name || ""
  }

  const getSelectedRegionName = () => {
    if (!selectedRegionId || !availableRegions) return ""
    const region = availableRegions.find(r => r.id === selectedRegionId)
    return region?.name || ""
  }

  const handleApply = () => {
    const filters: StudentFilters = {}
    
    if (selectedGenders.length > 0) filters.genders = selectedGenders
    if (selectedLanguageIds.length > 0) filters.languageIds = selectedLanguageIds
    if (selectedAcademicLevelIds.length > 0) filters.academicLevelIds = selectedAcademicLevelIds
    if (selectedZoneIds.length > 0) filters.zoneIds = selectedZoneIds
    // Commented out for now
    // if (selectedDisabilityIds.length > 0) filters.disabilityIds = selectedDisabilityIds
    // if (selectedMarginalizedGroupIds.length > 0) filters.marginalizedGroupIds = selectedMarginalizedGroupIds
    // if (selectedHasSmartphone !== undefined) filters.hasSmartphone = selectedHasSmartphone
    // if (selectedHasTrainingExperience !== undefined) filters.hasTrainingExperience = selectedHasTrainingExperience

    onApply(filters)
    setOpen(false)
  }

  const handleGenderToggle = (checked: boolean, gender: string) => {
    setSelectedGenders(prev =>
      checked ? [...prev, gender] : prev.filter(item => item !== gender)
    )
  }

  // Commented out for now
  // const handleSmartphoneToggle = (hasSmartphone: string) => {
  //   const boolValue = hasSmartphone === "true"
  //   setSelectedHasSmartphone(selectedHasSmartphone === boolValue ? undefined : boolValue)
  // }

  // const handleTrainingExperienceToggle = (hasTrainingExperience: string) => {
  //   const boolValue = hasTrainingExperience === "true"
  //   setSelectedHasTrainingExperience(selectedHasTrainingExperience === boolValue ? undefined : boolValue)
  // }

  const clearAllFilters = () => {
    setSelectedGenders([])
    setSelectedLanguageIds([])
    setSelectedAcademicLevelIds([])
    setSelectedZoneIds([])
    // Commented out for now
    // setSelectedDisabilityIds([])
    // setSelectedMarginalizedGroupIds([])
    // setSelectedHasSmartphone(undefined)
    // setSelectedHasTrainingExperience(undefined)
    setSelectedCountryId("")
    setSelectedRegionId("")
    
    // Apply empty filters immediately instead of waiting for state update
    onApply({})
    setOpen(false)
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
        className="w-[500px] p-6 max-h-[80vh] overflow-y-auto" 
        align="end" 
        alignOffset={-40}
        sideOffset={8}
      >
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Filter Students</h3>
          
          {/* Gender Filter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Gender</h4>
            <div className="grid grid-cols-2 gap-4">
              {genderOptions.map((gender) => (
                <div key={gender.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={gender.id}
                    checked={selectedGenders.includes(gender.id)}
                    onCheckedChange={(checked) => 
                      handleGenderToggle(checked as boolean, gender.id)
                    }
                    className="h-5 w-5 rounded-[4px] border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label 
                    htmlFor={gender.id}
                    className="text-base font-normal"
                  >
                    {gender.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Location</h4>
            
            {/* Country Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Country</Label>
              <Popover open={openCountries} onOpenChange={handleCountriesOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10"
                    type="button"
                  >
                    <span className="truncate">
                      {getSelectedCountryName() || "Select a country"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country.id}
                          className={cn(
                            "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors",
                            selectedCountryId === country.id && "bg-gray-100"
                          )}
                          onClick={() => handleCountryChange(country.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCountryId === country.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {country.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No countries found
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Region Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Region</Label>
              <Popover open={openRegions} onOpenChange={handleRegionsOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10"
                    disabled={!selectedCountryId}
                    type="button"
                  >
                    <span className="truncate">
                      {getSelectedRegionName() || (!selectedCountryId ? "Select country first" : "Select a region")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search regions..."
                        value={regionSearch}
                        onChange={(e) => setRegionSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredRegions.length > 0 ? (
                      filteredRegions.map((region) => (
                        <div
                          key={region.id}
                          className={cn(
                            "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors",
                            selectedRegionId === region.id && "bg-gray-100"
                          )}
                          onClick={() => handleRegionChange(region.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedRegionId === region.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {region.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        {selectedCountryId ? "No regions found" : "Select country first"}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Zone Multi-Select */}
            {selectedRegionId && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Zones</Label>
                <MultiSelectCombobox
                  options={availableZones.map(zone => ({ value: zone.id, label: zone.name }))}
                  selected={selectedZoneIds}
                  onChange={setSelectedZoneIds}
                  placeholder="Search and select zones..."
                  searchPlaceholder="Search zones..."
                  noResultsText="No zones found."
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Languages Filter */}
          {languages.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Languages</h4>
              <MultiSelectCombobox
                options={languages.map(lang => ({ value: lang.id, label: lang.name }))}
                selected={selectedLanguageIds}
                onChange={setSelectedLanguageIds}
                placeholder="Search and select languages..."
                searchPlaceholder="Search languages..."
                noResultsText="No languages found."
                className="w-full"
              />
            </div>
          )}

          {/* Academic Levels Filter */}
          {academicLevels.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Academic Levels</h4>
              <MultiSelectCombobox
                options={academicLevels.map(level => ({ value: level.id, label: level.name }))}
                selected={selectedAcademicLevelIds}
                onChange={setSelectedAcademicLevelIds}
                placeholder="Search and select academic levels..."
                searchPlaceholder="Search academic levels..."
                noResultsText="No academic levels found."
                className="w-full"
              />
            </div>
          )}

          {/* Commented out for now - can be enabled later */}
          {/* Disabilities Filter */}
          {/*disabilities.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Disabilities</h4>
              <MultiSelectCombobox
                options={disabilities.map(disability => ({ value: disability.id, label: disability.name }))}
                selected={selectedDisabilityIds}
                onChange={setSelectedDisabilityIds}
                placeholder="Search and select disabilities..."
                searchPlaceholder="Search disabilities..."
                noResultsText="No disabilities found."
                className="w-full"
              />
            </div>
          )*/}

          {/* Marginalized Groups Filter */}
          {/*marginalizedGroups.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Marginalized Groups</h4>
              <MultiSelectCombobox
                options={marginalizedGroups.map(group => ({ value: group.id, label: group.name }))}
                selected={selectedMarginalizedGroupIds}
                onChange={setSelectedMarginalizedGroupIds}
                placeholder="Search and select marginalized groups..."
                searchPlaceholder="Search marginalized groups..."
                noResultsText="No marginalized groups found."
                className="w-full"
              />
            </div>
          )*/}

          {/* Smartphone Filter */}
          {/*<div className="space-y-4">
            <h4 className="text-lg font-semibold">Smartphone Access</h4>
            <div className="grid grid-cols-2 gap-4">
              {smartphoneOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`smartphone-${option.id}`}
                    checked={selectedHasSmartphone === (option.id === "true")}
                    onCheckedChange={() => handleSmartphoneToggle(option.id)}
                    className="h-5 w-5 rounded-[4px] border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label 
                    htmlFor={`smartphone-${option.id}`}
                    className="text-base font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>*/}

          {/* Training Experience Filter */}
          {/*<div className="space-y-4">
            <h4 className="text-lg font-semibold">Training Experience</h4>
            <div className="grid grid-cols-2 gap-4">
              {trainingExperienceOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`training-${option.id}`}
                    checked={selectedHasTrainingExperience === (option.id === "true")}
                    onCheckedChange={() => handleTrainingExperienceToggle(option.id)}
                    className="h-5 w-5 rounded-[4px] border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label 
                    htmlFor={`training-${option.id}`}
                    className="text-base font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>*/}

          <div className="flex justify-between gap-4 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-200"
              onClick={clearAllFilters}
            >
              Clear All
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