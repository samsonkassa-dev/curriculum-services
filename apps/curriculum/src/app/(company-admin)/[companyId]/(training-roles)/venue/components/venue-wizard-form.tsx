"use client";

import React, { useEffect, useMemo, useState } from "react";
import { UseFormReturn, useFieldArray, Controller } from "react-hook-form";
import { VenueSchema } from "./venue-schema";
import { EquipmentItem, useEquipmentItems } from "@/lib/hooks/useVenue";
import { useBaseData } from "@/lib/hooks/useBaseData";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define interfaces for the location data
interface BaseItem {
  id: string;
  name: string;
  description: string;
}

interface Region extends BaseItem {
  country: BaseItem;
}

interface Zone extends BaseItem {
  region: BaseItem;
}

interface City extends BaseItem {
  zone?: BaseItem;
}

interface VenueWizardFormProps {
  form: UseFormReturn<VenueSchema>;
  currentStep: number;
  steps: { id: number; title: string }[];
  nextStep: () => void;
  prevStep: () => void;
  onSubmit: (data: VenueSchema) => void;
  onCancel: () => void;
  isLoading: boolean;
  companyId: string;
  isEditMode?: boolean;
  // Add props for initial location values in edit mode
  initialCountryId?: string;
  initialRegionId?: string;
}

export function VenueWizardForm({
  form,
  currentStep,
  steps,
  nextStep,
  prevStep,
  onSubmit,
  onCancel,
  isLoading,
  companyId,
  isEditMode = false,
  initialCountryId = "",
  initialRegionId = "",
}: VenueWizardFormProps) {
  // Local state for cascading selects (not part of form schema)
  const [selectedCountryId, setSelectedCountryId] = useState(initialCountryId);
  const [selectedRegionId, setSelectedRegionId] = useState(initialRegionId);

  // Popover states
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

  // Fetch location data with conditional enabling (like step-2)
  const { data: allCountries, isLoading: countriesLoading } = useBaseData("country", {
    enabled: true,
    disablePagination: true
  });
  
  const { data: allRegions, isLoading: regionsLoading } = useBaseData("region", {
    enabled: !!selectedCountryId,
    disablePagination: true
  });
  
  const { data: allZones, isLoading: zonesLoading } = useBaseData("zone", {
    enabled: !!selectedRegionId,
    disablePagination: true
  });
  
  const { data: allCities, isLoading: citiesLoading } = useBaseData("city", {
    enabled: !!form.watch("zoneId"),
    disablePagination: true
  });
  
  const { data: equipmentItems, isLoading: equipmentLoading } = useEquipmentItems();

  // Watch form values for cascading selects
  const selectedZoneId = form.watch("zoneId");

  // Filter data based on selections (client-side filtering for hierarchical relationships)
  const availableRegions = useMemo(() => {
    if (!selectedCountryId || !allRegions) return [];
    return (allRegions as Region[]).filter((region) => 
      region.country.id === selectedCountryId
    );
  }, [allRegions, selectedCountryId]);

  const availableZones = useMemo(() => {
    if (!selectedRegionId || !allZones) return [];
    return (allZones as Zone[]).filter((zone) => 
      zone.region.id === selectedRegionId
    );
  }, [allZones, selectedRegionId]);

  const availableCities = useMemo(() => {
    if (!selectedZoneId || !allCities) return [];
    return (allCities as City[]).filter((city) => 
      city.zone && city.zone.id === selectedZoneId
    );
  }, [allCities, selectedZoneId]);

  // Filter data based on search
  const filteredCountries = useMemo(() => {
    if (!allCountries) return [];
    return (allCountries as BaseItem[]).filter((country) =>
      country.name.toLowerCase().includes(debouncedCountrySearch.toLowerCase())
    );
  }, [allCountries, debouncedCountrySearch]);
  
  const filteredRegions = useMemo(() => {
    return availableRegions.filter((region) =>
      region.name.toLowerCase().includes(debouncedRegionSearch.toLowerCase())
    );
  }, [availableRegions, debouncedRegionSearch]);
  
  const filteredZones = useMemo(() => {
    return availableZones.filter((zone) =>
      zone.name.toLowerCase().includes(debouncedZoneSearch.toLowerCase())
    );
  }, [availableZones, debouncedZoneSearch]);
  
  const filteredCities = useMemo(() => {
    return availableCities.filter((city) =>
      city.name.toLowerCase().includes(debouncedCitySearch.toLowerCase())
    );
  }, [availableCities, debouncedCitySearch]);

  // Handle cascading selection changes
  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId);
    // Clear dependent selections
    setSelectedRegionId("");
    form.setValue("zoneId", "", { shouldValidate: true });
    form.setValue("cityId", "", { shouldValidate: true });
    setOpenCountries(false);
  };

  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    // Clear dependent selections
    form.setValue("zoneId", "", { shouldValidate: true });
    form.setValue("cityId", "", { shouldValidate: true });
    setOpenRegions(false);
  };

  const handleZoneChange = (zoneId: string) => {
    form.setValue("zoneId", zoneId, { shouldValidate: true });
    // Clear dependent selections
    form.setValue("cityId", "", { shouldValidate: true });
    setOpenZones(false);
  };

  const handleCityChange = (cityId: string) => {
    form.setValue("cityId", cityId, { shouldValidate: true });
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
    if (!selectedCountryId || !allCountries) return "";
    const country = (allCountries as BaseItem[]).find(c => c.id === selectedCountryId);
    return country?.name || "";
  };

  const getSelectedRegionName = () => {
    if (!selectedRegionId || !availableRegions) return "";
    const region = availableRegions.find(r => r.id === selectedRegionId);
    return region?.name || "";
  };

  const getSelectedZoneName = () => {
    if (!selectedZoneId || !availableZones) return "";
    const zone = availableZones.find(z => z.id === selectedZoneId);
    return zone?.name || "";
  };

  const getSelectedCityName = () => {
    const cityId = form.watch("cityId");
    if (!cityId || !availableCities) return "";
    const city = availableCities.find(c => c.id === cityId);
    return city?.name || "";
  };

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "venueRequirements",
  });

  // Initialize venue requirements based on equipment items
  useEffect(() => {
    if (equipmentItems && fields.length === 0 && !isLoading) {
      const initialRequirements = equipmentItems.map((item) => ({
        equipmentItemId: item.id,
        numericValue: 0,
        remark: "",
        available: false,
      }));
      
      replace(initialRequirements);
    }
  }, [equipmentItems, fields.length, isLoading, replace]);

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getEquipmentItemDetails = (id: string): EquipmentItem | undefined => {
    return equipmentItems?.find((item) => item.id === id);
  };

  const isStep1 = currentStep === 1;
  const isStep2 = currentStep === 2;
  const isStep3 = currentStep === 3;
  const isLastStep = currentStep === steps.length;

  // Function to validate and go to next step
  const handleNextStep = async () => {
    let fieldsToValidate: (keyof VenueSchema)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'location', 'zoneId', 'cityId', 'woreda'];
    } else if (currentStep === 2) {
      // Step 2 validation is handled by the dynamic form fields
      nextStep();
      return;
    } else if (currentStep === 3) {
      fieldsToValidate = ['seatingCapacity', 'roomCount', 'totalArea'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      nextStep();
    }
  };

  return (
    <Form {...form}>
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-grow mb-4 pr-4 max-h-[calc(100vh-280px)]">
          <div className="space-y-6 p-4">
            {/* Step 1: General Details */}
            {isStep1 && (
              <div className="space-y-8 p-4 rounded-md bg-white">
                <h3 className="text-lg font-semibold">General Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter venue name"
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-offset-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Description</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Building A, Room 101"
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-offset-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Country Selection with Search */}
                  <div className="space-y-2">
                    <Label>Country <span className="text-red-500">*</span></Label>
                    <Popover open={openCountries} onOpenChange={handleCountriesOpenChange}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between py-6 border-[#E4E4E4] rounded-md"
                          disabled={isLoading || countriesLoading}
                          type="button"
                        >
                          <span className="truncate">
                            {getSelectedCountryName() || "Select a country"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-full p-0" 
                        align="start"
                      >
                        <div className="p-2">
                          <Input
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="max-h-[200px] overflow-auto">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <div
                                key={country.id}
                                className={cn(
                                  "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100",
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
                              {countrySearch ? "No countries found" : "No countries available"}
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Region Selection with Search */}
                  <div className="space-y-2">
                    <Label>Region <span className="text-red-500">*</span></Label>
                    <Popover open={openRegions} onOpenChange={handleRegionsOpenChange}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between py-6 border-[#E4E4E4] rounded-md"
                          disabled={isLoading || regionsLoading || !selectedCountryId}
                          type="button"
                        >
                          <span className="truncate">
                            {getSelectedRegionName() || (!selectedCountryId ? "Select country first" : "Select a region")}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-full p-0" 
                        align="start"
                      >
                        <div className="p-2">
                          <Input
                            placeholder="Search regions..."
                            value={regionSearch}
                            onChange={(e) => setRegionSearch(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="max-h-[200px] overflow-auto">
                          {filteredRegions.length > 0 ? (
                            filteredRegions.map((region) => (
                              <div
                                key={region.id}
                                className={cn(
                                  "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100",
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
                  </div>

                  {/* Zone Selection with Search */}
                  <FormField
                    control={form.control}
                    name="zoneId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zone <span className="text-red-500">*</span></FormLabel>
                        <Popover open={openZones} onOpenChange={handleZonesOpenChange}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between py-6 border-[#E4E4E4] rounded-md"
                              disabled={isLoading || zonesLoading || !selectedRegionId}
                              type="button"
                            >
                              <span className="truncate">
                                {getSelectedZoneName() || (!selectedRegionId ? "Select region first" : "Select a zone")}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-full p-0" 
                            align="start"
                          >
                            <div className="p-2">
                              <Input
                                placeholder="Search zones..."
                                value={zoneSearch}
                                onChange={(e) => setZoneSearch(e.target.value)}
                                className="h-9"
                              />
                            </div>
                            <div className="max-h-[200px] overflow-auto">
                              {filteredZones.length > 0 ? (
                                filteredZones.map((zone) => (
                                  <div
                                    key={zone.id}
                                    className={cn(
                                      "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100",
                                      selectedZoneId === zone.id && "bg-gray-100"
                                    )}
                                    onClick={() => handleZoneChange(zone.id)}
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
                        <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                        <Popover open={openCities} onOpenChange={handleCitiesOpenChange}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between py-6 border-[#E4E4E4] rounded-md"
                              disabled={isLoading || citiesLoading || !selectedZoneId}
                              type="button"
                            >
                              <span className="truncate">
                                {getSelectedCityName() || (!selectedZoneId ? "Select zone first" : "Select a city")}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-full p-0" 
                            align="start"
                          >
                            <div className="p-2">
                              <Input
                                placeholder="Search cities..."
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                                className="h-9"
                              />
                            </div>
                            <div className="max-h-[200px] overflow-auto">
                              {filteredCities.length > 0 ? (
                                filteredCities.map((city) => (
                                  <div
                                    key={city.id}
                                    className={cn(
                                      "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100",
                                      field.value === city.id && "bg-gray-100"
                                    )}
                                    onClick={() => handleCityChange(city.id)}
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

                  <FormField
                    control={form.control}
                    name="woreda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Woreda / Kebele</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter woreda or kebele"
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-offset-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : parseFloat(e.target.value)
                              )
                            }
                            placeholder="e.g., 9.005401"
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-offset-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : parseFloat(e.target.value)
                              )
                            }
                            placeholder="e.g., 38.763611"
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-offset-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Resource Availability */}
            {isStep2 && (
              <div className="space-y-6 p-4 border rounded-md bg-white">
                <h3 className="text-lg font-semibold">Resource Availability</h3>
                {equipmentLoading && <p>Loading requirements...</p>}
                {!equipmentLoading && !equipmentItems?.length && (
                  <p>No equipment items configured.</p>
                )}
                {!equipmentLoading &&
                  equipmentItems &&
                  fields.map((field, index) => {
                    const itemDetails = getEquipmentItemDetails(
                      field.equipmentItemId
                    );
                    if (!itemDetails) return null;

                    const isQualitative =
                      itemDetails.equipmentItemType === "QUALITATIVE";
                    const isQuantitative =
                      itemDetails.equipmentItemType === "QUANTITATIVE";
                    const availableValue = form.watch(
                      `venueRequirements.${index}.available`
                    );
                    const showNumericInput =
                      availableValue === true && isQuantitative;
                    const showRemarkInput =
                      availableValue === false && isQualitative;

                    return (
                      <div
                        key={field.id}
                        className="p-4 border rounded-md space-y-3 bg-gray-50/50 mb-4"
                      >
                        <FormLabel className="font-medium">
                          {itemDetails.question}
                        </FormLabel>
                        {itemDetails.description && (
                          <p className="text-sm text-muted-foreground">
                            {itemDetails.description}
                          </p>
                        )}

                        {isQualitative && (
                          <FormField
                            control={form.control}
                            name={`venueRequirements.${index}.available`}
                            render={({ field: radioField }) => (
                              <FormItem className="space-y-2">
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={(value) => {
                                      const boolValue =
                                        value === "true"
                                          ? true
                                          : value === "false"
                                          ? false
                                          : undefined;
                                      radioField.onChange(boolValue);
                                      if (boolValue !== false) {
                                        form.setValue(
                                          `venueRequirements.${index}.remark`,
                                          "",
                                          { shouldValidate: true }
                                        );
                                      }
                                    }}
                                    value={
                                      radioField.value !== undefined
                                        ? String(radioField.value)
                                        : undefined
                                    }
                                    className="flex gap-6 pt-1"
                                    disabled={isLoading}
                                  >
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <RadioGroupItem
                                          value="true"
                                          id={`${field.id}-yes`}
                                        />
                                      </FormControl>
                                      <Label htmlFor={`${field.id}-yes`}>
                                        Yes
                                      </Label>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <RadioGroupItem
                                          value="false"
                                          id={`${field.id}-no`}
                                        />
                                      </FormControl>
                                      <Label htmlFor={`${field.id}-no`}>
                                        No
                                      </Label>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                <FormField
                                  control={form.control}
                                  name={`venueRequirements.${index}.remark`}
                                  render={({ field: remarkField }) => (
                                    <FormItem
                                      className={cn(
                                        !showRemarkInput && "hidden"
                                      )}
                                    >
                                      <FormLabel className="text-sm">
                                        Remark (If No)
                                      </FormLabel>
                                      <FormControl>
                                        <Textarea
                                          {...remarkField}
                                          placeholder="Provide a reason or alternative"
                                          disabled={
                                            isLoading || !showRemarkInput
                                          }
                                          className="mt-1 focus:outline-none focus:ring-1 focus:ring-offset-1"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </FormItem>
                            )}
                          />
                        )}

                        {isQuantitative && (
                          <>
                            <FormField
                              control={form.control}
                              name={`venueRequirements.${index}.available`}
                              render={({ field: radioField }) => (
                                <FormItem className="space-y-2">
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={(value) => {
                                        const boolValue =
                                          value === "true"
                                            ? true
                                            : value === "false"
                                            ? false
                                            : undefined;
                                        radioField.onChange(boolValue);
                                        if (boolValue !== true) {
                                          form.setValue(
                                            `venueRequirements.${index}.numericValue`,
                                            0,
                                            { shouldValidate: true }
                                          );
                                        }
                                      }}
                                      value={
                                        radioField.value !== undefined
                                          ? String(radioField.value)
                                          : undefined
                                      }
                                      className="flex gap-6 pt-1"
                                      disabled={isLoading}
                                    >
                                      <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                          <RadioGroupItem
                                            value="true"
                                            id={`${field.id}-yes`}
                                          />
                                        </FormControl>
                                        <Label htmlFor={`${field.id}-yes`}>
                                          Yes
                                        </Label>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                          <RadioGroupItem
                                            value="false"
                                            id={`${field.id}-no`}
                                          />
                                        </FormControl>
                                        <Label htmlFor={`${field.id}-no`}>
                                          No
                                        </Label>
                                      </FormItem>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`venueRequirements.${index}.numericValue`}
                              render={({ field: numField }) => (
                                <FormItem className={cn(!showNumericInput && "hidden")}>
                                  <FormLabel className="text-sm">
                                    If Yes, how many?
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      {...numField}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        numField.onChange(
                                          val === ""
                                            ? 0
                                            : parseInt(val, 10)
                                        );
                                      }}
                                      value={numField.value ?? ""}
                                      placeholder="Enter quantity"
                                      disabled={isLoading || !showNumericInput}
                                      className="mt-1 w-1/2 focus:outline-none focus:ring-1 focus:ring-offset-1"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Step 3: Venue Capacity & Features */}
            {isStep3 && (
              <div className="space-y-6 p-4 border rounded-md bg-white">
                <h3 className="text-lg font-semibold">Venue Capacity & Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="seatingCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seating Capacity <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : parseInt(e.target.value, 10)
                              )
                            }
                            placeholder="e.g., 30"
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-offset-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="standingCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Standing Capacity (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : parseInt(e.target.value, 10)
                              )
                            }
                            placeholder="e.g., 50"
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-offset-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roomCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Rooms <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : parseInt(e.target.value, 10)
                              )
                            }
                            placeholder="e.g., 2"
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-offset-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Area (m²) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            step="0.01"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : parseFloat(e.target.value)
                              )
                            }
                            placeholder="e.g., 100.5"
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-offset-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2 space-y-6">
                    <div className="flex flex-row space-x-8">
                      <FormField
                        control={form.control}
                        name="hasAccessibility"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                                className="focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Accessibility Features
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Venue has facilities for people with disabilities
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hasParkingSpace"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                                className="focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Parking Available
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Venue provides parking spaces
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="accessibilityFeatures"
                      render={({ field }) => (
                        <FormItem className={cn(!form.watch("hasAccessibility") && "hidden")}>
                          <FormLabel>Accessibility Details</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe accessibility features (ramps, elevators, etc.)"
                              disabled={isLoading || !form.watch("hasAccessibility")}
                              className="min-h-[80px] focus:outline-none focus:ring-1 focus:ring-offset-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parkingCapacity"
                      render={({ field }) => (
                        <FormItem className={cn(!form.watch("hasParkingSpace") && "hidden")}>
                          <FormLabel>Parking Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : parseInt(e.target.value, 10)
                                )
                              }
                              placeholder="Number of parking spaces"
                              disabled={isLoading || !form.watch("hasParkingSpace")}
                              className="w-1/2 focus:outline-none focus:ring-1 focus:ring-offset-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                            className="focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Venue Active Status
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Is this venue currently active and available for booking?
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-auto pt-4 border-t flex justify-between gap-4">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}

          {!isLastStep ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isLoading}
              className="bg-brand hover:bg-blue-700 text-white"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFormSubmit}
              disabled={isLoading}
              className="bg-brand hover:bg-blue-700 text-white"
            >
              {isLoading ? "Submitting..." : isEditMode ? "Update Venue" : "Submit Venue"}
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}
