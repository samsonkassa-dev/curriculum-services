"use client"

import { UseFormReturn } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrainerFormValues } from "../page"
import { AcademicLevel, TrainingTag, Language } from "@/lib/hooks/useTrainers"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { useSingleCascadingLocation } from "@/lib/hooks/useCascadingLocation"
import { BaseItem } from "@/types/curriculum"
import { Search } from "lucide-react"

// Location interfaces
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

interface City {
  id: string
  name: string
  description: string
  zone?: Zone
}

interface TrainerProfessionalInfoFormProps {
  form: UseFormReturn<TrainerFormValues>
  trainingTags: TrainingTag[]
  academicLevels: AcademicLevel[]
  languages: Language[]
  disabled?: boolean
}

export function TrainerProfessionalInfoForm({ 
  form, 
  trainingTags,
  academicLevels,
  languages,
  disabled = false
}: TrainerProfessionalInfoFormProps) {
  const [openTagsPopover, setOpenTagsPopover] = useState(false);
  
  // Location popover states
  const [openCountries, setOpenCountries] = useState(false);
  const [openRegions, setOpenRegions] = useState(false);
  const [openZones, setOpenZones] = useState(false);
  const [openCities, setOpenCities] = useState(false);
  
  // Search states
  const [countrySearch, setCountrySearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [zoneSearch, setZoneSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  
  // Debounced search values
  const debouncedCountrySearch = useDebounce(countrySearch, 300);
  const debouncedRegionSearch = useDebounce(regionSearch, 300);
  const debouncedZoneSearch = useDebounce(zoneSearch, 300);
  const debouncedCitySearch = useDebounce(citySearch, 300);

  // Watch form values for cascading selects
  const selectedCountryId = form.watch('countryId') || '';
  const selectedRegionId = form.watch('regionId') || '';
  const selectedZoneId = form.watch('zoneId') || '';
  const selectedCityId = form.watch('cityId') || '';

  // Use cascading location hook
  const {
    countries,
    regions,
    zones,
    cities,
    isLoadingCountries,
    isLoadingRegions,
    isLoadingZones,
    isLoadingCities
  } = useSingleCascadingLocation(selectedCountryId, selectedRegionId, selectedZoneId);

  // Filter data based on selections (client-side filtering for hierarchical relationships)
  const availableRegions = useMemo(() => {
    if (!selectedCountryId || !regions) return [];
    return regions.filter((region: Region) => 
      region.country.id === selectedCountryId
    );
  }, [regions, selectedCountryId]);
  
  const availableZones = useMemo(() => {
    if (!selectedRegionId || !zones) return [];
    return zones.filter((zone: Zone) => 
      zone.region.id === selectedRegionId
    );
  }, [zones, selectedRegionId]);
  
  const availableCities = useMemo(() => {
    if (!selectedZoneId || !cities) return [];
    return cities.filter((city: City) => 
      city.zone && city.zone.id === selectedZoneId
    );
  }, [cities, selectedZoneId]);

  // Filter data based on search
  const filteredCountries = useMemo(() => {
    if (!countries) return [];
    return countries.filter((country: Country) =>
      country.name.toLowerCase().includes(debouncedCountrySearch.toLowerCase())
    );
  }, [countries, debouncedCountrySearch]);
  
  const filteredRegions = useMemo(() => {
    return availableRegions.filter((region: Region) =>
      region.name.toLowerCase().includes(debouncedRegionSearch.toLowerCase())
    );
  }, [availableRegions, debouncedRegionSearch]);
  
  const filteredZones = useMemo(() => {
    return availableZones.filter((zone: Zone) =>
      zone.name.toLowerCase().includes(debouncedZoneSearch.toLowerCase())
    );
  }, [availableZones, debouncedZoneSearch]);
  
  const filteredCities = useMemo(() => {
    return availableCities.filter((city: City) =>
      city.name.toLowerCase().includes(debouncedCitySearch.toLowerCase())
    );
  }, [availableCities, debouncedCitySearch]);

  // Handle cascading selection changes
  const handleCountryChange = (countryId: string) => {
    form.setValue('countryId', countryId, { shouldValidate: true });
    // Clear dependent selections
    form.setValue('regionId', '', { shouldValidate: true });
    form.setValue('zoneId', '', { shouldValidate: true });
    form.setValue('cityId', '', { shouldValidate: true });
    setOpenCountries(false);
  };

  const handleRegionChange = (regionId: string) => {
    form.setValue('regionId', regionId, { shouldValidate: true });
    // Clear dependent selections
    form.setValue('zoneId', '', { shouldValidate: true });
    form.setValue('cityId', '', { shouldValidate: true });
    setOpenRegions(false);
  };

  const handleZoneChange = (zoneId: string) => {
    form.setValue('zoneId', zoneId, { shouldValidate: true });
    // Clear dependent selections
    form.setValue('cityId', '', { shouldValidate: true });
    setOpenZones(false);
  };

  const handleCityChange = (cityId: string) => {
    form.setValue('cityId', cityId, { shouldValidate: true });
    setOpenCities(false);
  };

  // Clear search when popovers close
  const handleCountriesOpenChange = (open: boolean) => {
    setOpenCountries(open);
    if (!open) setCountrySearch('');
  };

  const handleRegionsOpenChange = (open: boolean) => {
    setOpenRegions(open);
    if (!open) setRegionSearch('');
  };

  const handleZonesOpenChange = (open: boolean) => {
    setOpenZones(open);
    if (!open) setZoneSearch('');
  };

  const handleCitiesOpenChange = (open: boolean) => {
    setOpenCities(open);
    if (!open) setCitySearch('');
  };

  // Get display names for selected items
  const getSelectedCountryName = () => {
    if (!selectedCountryId || !countries) return "";
    const country = countries.find((c: Country) => c.id === selectedCountryId);
    return country?.name || "";
  };

  const getSelectedRegionName = () => {
    if (!selectedRegionId || !availableRegions) return "";
    const region = availableRegions.find((r: Region) => r.id === selectedRegionId);
    return region?.name || "";
  };

  const getSelectedZoneName = () => {
    if (!selectedZoneId || !availableZones) return "";
    const zone = availableZones.find((z: Zone) => z.id === selectedZoneId);
    return zone?.name || "";
  };

  const getSelectedCityName = () => {
    if (!selectedCityId || !availableCities) return "";
    const city = availableCities.find((c: City) => c.id === selectedCityId);
    return city?.name || "";
  };
  
  const handleSelectTrainingTag = (tagId: string) => {
    if (disabled) return;
    const currentTags = form.getValues("trainingTagIds") || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    form.setValue("trainingTagIds", newTags, { shouldValidate: true });
    // Don't close the popover to allow multiple selections
  };

  return (
    <div className="space-y-8">
      {/* Language Select */}
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="languageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-medium text-gray-800">Primary Language</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={disabled}>
                <FormControl>
                  <SelectTrigger className="h-12 border-[#E4E4E4] rounded-md">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages?.map((language) => (
                    <SelectItem key={language.id} value={language.id}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Location Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Address Information</h3>
          
          {/* Country and Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Country Selection with Search */}
            <FormField
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Country <span className="text-red-500">*</span></FormLabel>
                  <FormDescription className="text-gray-500 text-sm">
                    Select your country
                  </FormDescription>
                  <Popover open={openCountries} onOpenChange={handleCountriesOpenChange}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12"
                        disabled={!countries || disabled}
                        type="button"
                      >
                        <span className="truncate">
                          {!countries ? "Loading countries..." : (getSelectedCountryName() || "Select a country")}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] p-0" 
                      align="start" 
                      side="bottom" 
                      sideOffset={4}
                    >
                      {/* Search Input */}
                      <div className="p-3 border-b" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="pl-9"
                            autoFocus={false}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-[200px] sm:max-h-[250px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {!countries ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            Loading countries...
                          </div>
                        ) : filteredCountries.length > 0 ? (
                          filteredCountries.map((country: Country) => (
                            <div
                              key={country.id}
                              className={cn(
                                "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors",
                                selectedCountryId === country.id && "bg-gray-100"
                              )}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCountryChange(country.id);
                              }}
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
                            {countrySearch ? "No countries found" : "No countries available"}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Region Selection with Search */}
            <FormField
              control={form.control}
              name="regionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Region <span className="text-red-500">*</span></FormLabel>
                  <FormDescription className="text-gray-500 text-sm">
                    Select your region
                  </FormDescription>
                  <Popover open={openRegions} onOpenChange={handleRegionsOpenChange}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12"
                        disabled={!selectedCountryId || disabled}
                        type="button"
                      >
                        <span className="truncate">
                          {getSelectedRegionName() || (!selectedCountryId ? "Select country first" : "Select a region")}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] p-0" 
                      align="start" 
                      side="bottom" 
                      sideOffset={4}
                    >
                      {/* Search Input */}
                      <div className="p-3 border-b" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search regions..."
                            value={regionSearch}
                            onChange={(e) => setRegionSearch(e.target.value)}
                            className="pl-9"
                            autoFocus={false}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-[200px] sm:max-h-[250px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {filteredRegions.length > 0 ? (
                          filteredRegions.map((region: Region) => (
                            <div
                              key={region.id}
                              className={cn(
                                "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors",
                                selectedRegionId === region.id && "bg-gray-100"
                              )}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRegionChange(region.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedRegionId === region.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {region.name} ({region.country.name})
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            {regionSearch ? "No regions found" : selectedCountryId ? "No regions available for selected country" : "Please select country first"}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Zone and City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zone Selection with Search */}
            <FormField
              control={form.control}
              name="zoneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Zone <span className="text-red-500">*</span></FormLabel>
                  <FormDescription className="text-gray-500 text-sm">
                    Select your zone
                  </FormDescription>
                  <Popover open={openZones} onOpenChange={handleZonesOpenChange}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12"
                        disabled={!selectedRegionId || disabled}
                        type="button"
                      >
                        <span className="truncate">
                          {getSelectedZoneName() || (!selectedRegionId ? "Select region first" : "Select a zone")}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] p-0" 
                      align="start" 
                      side="bottom" 
                      sideOffset={4}
                    >
                      {/* Search Input */}
                      <div className="p-3 border-b" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search zones..."
                            value={zoneSearch}
                            onChange={(e) => setZoneSearch(e.target.value)}
                            className="pl-9"
                            autoFocus={false}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-[200px] sm:max-h-[250px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {filteredZones.length > 0 ? (
                          filteredZones.map((zone: Zone) => (
                            <div
                              key={zone.id}
                              className={cn(
                                "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors",
                                selectedZoneId === zone.id && "bg-gray-100"
                              )}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleZoneChange(zone.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedZoneId === zone.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {zone.name} ({zone.region.name})
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            {zoneSearch ? "No zones found" : selectedRegionId ? "No zones available for selected region" : "Please select region first"}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City Selection with Search */}
            <FormField
              control={form.control}
              name="cityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">City/Town </FormLabel>
                  <FormDescription className="text-gray-500 text-sm">
                    Select your city or town
                  </FormDescription>
                  <Popover open={openCities} onOpenChange={handleCitiesOpenChange}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12"
                        disabled={!selectedZoneId || disabled}
                        type="button"
                      >
                        <span className="truncate">
                          {getSelectedCityName() || (!selectedZoneId ? "Select zone first" : "Select a city")}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] p-0" 
                      align="start" 
                      side="bottom" 
                      sideOffset={4}
                    >
                      {/* Search Input */}
                      <div className="p-3 border-b" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search cities..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="pl-9"
                            autoFocus={false}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-[200px] sm:max-h-[250px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city: City) => (
                            <div
                              key={city.id}
                              className={cn(
                                "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors",
                                field.value === city.id && "bg-gray-100"
                              )}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCityChange(city.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === city.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            {citySearch ? "No cities found" : selectedZoneId ? "No cities available for selected zone" : "Please select zone first"}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-medium text-gray-800">Additional Location Details</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter additional location information" 
                  {...field} 
                  className="h-12 border-[#E4E4E4] rounded-md"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Training Tags (Multi-select Popover) */}
      <div className="space-y-2">
        <div>
          <FormLabel className="text-[16px] font-medium text-gray-800">Training Tags</FormLabel>
          <p className="text-sm text-gray-500 mt-1">Select all training tags that apply to your expertise.</p>
        </div>
        <FormField
          control={form.control}
          name="trainingTagIds"
          render={({ field }) => (
            <FormItem>
              <Popover 
                open={openTagsPopover && !disabled} 
                onOpenChange={setOpenTagsPopover}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    type="button"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between py-6 border-[#E4E4E4] rounded-md",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      if (!disabled) {
                        e.preventDefault();
                        setOpenTagsPopover(!openTagsPopover);
                      }
                    }}
                  >
                    <div className="flex flex-wrap gap-1 items-center">
                      {field.value && field.value.length > 0 ? (
                        <>
                          {field.value.map((id) => {
                            const tag = trainingTags?.find((tag) => tag.id === id);
                            return (
                              <Badge key={`tag-${id}`} variant="secondary">
                                {tag?.name || id}
                              </Badge>
                            );
                          })}
                        </>
                      ) : (
                        "Select training tags..."
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-[300px] overflow-auto">
                    {trainingTags && trainingTags.length > 0 ? (
                      trainingTags.map((tag) => (
                        <div
                          key={tag.id}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100",
                            field.value?.includes(tag.id) && "bg-gray-100"
                          )}
                          onClick={() => handleSelectTrainingTag(tag.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value?.includes(tag.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {tag.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No training tags available
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Years of Training Experience */}
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="experienceYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-medium text-gray-800">Years of Training Experience</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  className="h-12 border-[#E4E4E4] rounded-md"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Courses Taught */}
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="coursesTaught"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-medium text-gray-800">Courses Taught</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter courses taught, separated by commas"
                  className="min-h-[100px] border-[#E4E4E4] rounded-md"
                  value={field.value?.join(", ") || ""}
                  onChange={e => {
                    const courses = e.target.value.split(",").map(item => item.trim()).filter(Boolean);
                    field.onChange(courses);
                  }}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Qualification Level */}
      <div className="space-y-2">
        <div>
          <FormLabel className="text-[16px] font-medium text-gray-800">Qualification Level & Certification</FormLabel>
          <p className="text-sm text-gray-500 mt-1">Select the certification awarded upon completion and its corresponding qualification level.</p>
        </div>
        <FormField
          control={form.control}
          name="academicLevelId"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={disabled}>
                <FormControl>
                  <SelectTrigger className="h-12 border-[#E4E4E4] rounded-md">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {academicLevels?.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Certification Details */}
      <div className="space-y-2">
        <div>
          <FormLabel className="text-[16px] font-medium text-gray-800">Certification Details</FormLabel>
          <p className="text-sm text-gray-500 mt-1">List any relevant certifications</p>
        </div>
        <FormField
          control={form.control}
          name="certifications"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  placeholder="Enter certifications, separated by commas"
                  className="min-h-[100px] border-[#E4E4E4] rounded-md"
                  value={field.value?.join(", ") || ""}
                  onChange={e => {
                    const certifications = e.target.value.split(",").map(item => item.trim()).filter(Boolean);
                    field.onChange(certifications);
                  }}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
} 