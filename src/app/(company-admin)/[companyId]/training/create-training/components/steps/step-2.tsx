"use client"

import { useState, useEffect, useRef, useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { useBaseData } from '@/lib/hooks/useBaseData'
import { useCities } from '@/lib/hooks/useCities'
import { StepProps } from '../types'
import { z } from 'zod'
import { BaseItem } from '@/types/training-form'

const locationSchema = z.object({
  cityIds: z.array(z.string()).min(1, "At least one city must be selected"),
  countryIds: z.array(z.string()).min(1, "At least one country must be selected")
})

type LocationFormData = z.infer<typeof locationSchema>

interface City {
  id: string;
  name: string;
  description: string;
  country: BaseItem;
}

// Action types for our reducer
type LocationAction = 
  | { type: 'SET_COUNTRIES', payload: string[] }
  | { type: 'SET_CITIES', payload: City[] }
  | { type: 'UPDATE_CITIES', payload: { cities: City[], countryIds: string[] } };

// State for our reducer
interface LocationState {
  selectedCountryIds: string[];
  availableCities: City[];
}

// Reducer function for managing related state
function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_COUNTRIES':
      // Only update if different from current state
      if (JSON.stringify(state.selectedCountryIds) === JSON.stringify(action.payload)) {
        return state;
      }
      return {
        ...state,
        selectedCountryIds: action.payload
      };
    case 'SET_CITIES':
      // Only update if different from current state
      if (JSON.stringify(state.availableCities) === JSON.stringify(action.payload)) {
        return state;
      }
      return {
        ...state,
        availableCities: action.payload
      };
    case 'UPDATE_CITIES':
      // Filter cities to only include those from selected countries
      const filteredCities = action.payload.cities.filter(city => 
        action.payload.countryIds.includes(city.country.id)
      );
      
      // Deduplicate cities by id
      const uniqueCities = filteredCities.filter((city, index, self) =>
        index === self.findIndex(c => c.id === city.id)
      );
      
      // Skip update if nothing changed
      if (JSON.stringify(state.availableCities) === JSON.stringify(uniqueCities)) {
        return state;
      }
      
      return {
        ...state,
        availableCities: uniqueCities
      };
    default:
      return state;
  }
}

export function CreateTrainingStep2({ onNext, onBack, initialData, onCancel, isEditing = false }: StepProps) {
  // Track if this is first render
  const isFirstRender = useRef(true);
  const prevCountryIdsRef = useRef<string[]>([]);
  
  // Refs for popover state
  const [open, setOpen] = useState(false);
  const [openCities, setOpenCities] = useState(false);
  
  // Initialize with reducer instead of multiple useState calls
  const [locationState, dispatch] = useReducer(locationReducer, {
    selectedCountryIds: initialData?.countryIds || [],
    availableCities: []
  });
  
  const { selectedCountryIds, availableCities } = locationState;
  
  // The react-hook-form setup
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      cityIds: initialData?.cityIds || [],
      countryIds: initialData?.countryIds || []
    }
  });

  const selectedCityIds = watch('cityIds');
  
  // Fetch all available countries
  const { data: allCountries, isLoading: isLoadingCountries } = useBaseData(
    'country', 
    { enabled: true }
  )
  
  // Fetch cities based on selected countries
  const { 
    data: fetchedCities, 
    isLoading: isLoadingCities 
  } = useCities(selectedCountryIds, { enabled: selectedCountryIds.length > 0 });
  
  // Get references to preloaded and fetched data
  const preloadedCities = initialData?.preloadedCities || [];
  
  // Merge preloaded and fetched data for countries
  const safeCountries = initialData?.preloadedCountries?.length 
    ? [...(initialData.preloadedCountries || []), ...(allCountries || [])]
        .filter((value, index, self) => 
          index === self.findIndex((t) => t.id === value.id)
        )
    : allCountries || [];

  // Process cities when they're fetched
  useEffect(() => {
    // Get all available cities (both preloaded and fetched)
    const allCities = [...preloadedCities];
    
    // Add fetched cities that aren't already in the list
    if (fetchedCities) {
      fetchedCities.forEach(city => {
        if (!allCities.some(c => c.id === city.id)) {
          allCities.push(city);
        }
      });
    }
    
    // Only filter cities by selected countries if we have both
    if (allCities.length && selectedCountryIds.length) {
      // Filter to only include cities from selected countries
      dispatch({
        type: 'UPDATE_CITIES',
        payload: {
          cities: allCities,
          countryIds: selectedCountryIds
        }
      });
    }
  }, [fetchedCities, selectedCountryIds]); // React will dedupe this array

  // Initialize form values on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCountryIdsRef.current = selectedCountryIds;
      
      // Ensure form values match our state
      setValue('countryIds', selectedCountryIds);
    }
  }, []);

  const handleSelectCountry = (countryId: string) => {
    // First check if this would cause a change
    const isSelected = selectedCountryIds.includes(countryId);
    let newCountryIds: string[];
    
    if (isSelected) {
      // Remove country
      newCountryIds = selectedCountryIds.filter(id => id !== countryId);
      
      // Also remove cities from this country
      const currentCityIds = selectedCityIds || [];
      const newCityIds = currentCityIds.filter(cityId => {
        const city = availableCities.find(c => c.id === cityId);
        return city && newCountryIds.includes(city.country.id);
      });
      
      setValue('cityIds', newCityIds, { shouldValidate: true });
    } else {
      // Add country
      newCountryIds = [...selectedCountryIds, countryId];
    }
    
    // Skip update if nothing changed
    if (JSON.stringify(newCountryIds) === JSON.stringify(selectedCountryIds)) {
      return;
    }
    
    // Update form values
    setValue('countryIds', newCountryIds, { shouldValidate: true });
    
    // Update state
    prevCountryIdsRef.current = newCountryIds;
    dispatch({ type: 'SET_COUNTRIES', payload: newCountryIds });
  };

  const handleSelectCity = (cityId: string) => {
    const currentCityIds = selectedCityIds || [];
    const newCityIds = currentCityIds.includes(cityId)
      ? currentCityIds.filter(id => id !== cityId)
      : [...currentCityIds, cityId];
    
    setValue('cityIds', newCityIds, { shouldValidate: true });
  };

  const onSubmit = (data: LocationFormData) => {
    // Make sure both countryIds and cityIds are included
    onNext({
      ...data,
      countryIds: selectedCountryIds
    });
  };

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
                disabled={isLoadingCountries && !safeCountries?.length}
                type="button"
              >
                <div className="flex flex-wrap gap-1">
                  {selectedCountryIds.length > 0 ? (
                    selectedCountryIds.map(countryId => {
                      const countryName = safeCountries.find((c: BaseItem) => c.id === countryId)?.name
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
                {safeCountries.map((country: BaseItem) => (
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
          {errors.countryIds && (
            <p className="text-sm text-red-500">{errors.countryIds.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cities</label>
          <Popover open={openCities} onOpenChange={setOpenCities}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between py-6"
                disabled={(isLoadingCities && !availableCities?.length) || !selectedCountryIds.length}
                type="button"
              >
                <div className="flex flex-wrap gap-1">
                  {selectedCityIds?.length > 0 ? (
                    selectedCityIds.map(cityId => {
                      const city = availableCities.find(c => c.id === cityId)
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
                {availableCities.length > 0 ? (
                  availableCities.map((city) => (
                    <div
                      key={city.id}
                      className={cn(
                        "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100",
                        selectedCityIds?.includes(city.id) && "bg-gray-100"
                      )}
                      onClick={() => handleSelectCity(city.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCityIds?.includes(city.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {city.name} ({city.country.name})
                    </div>
                  ))
                ) : selectedCountryIds.length ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    {isLoadingCities ? "Loading cities..." : "No cities available for selected countries"}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Please select countries first
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.cityIds && (
            <p className="text-sm text-red-500">{errors.cityIds.message}</p>
          )}
        </div>

        <div className="flex justify-between pt-8">
          {isEditing ? (
            <>
              <Button onClick={onBack} variant="outline" type="button">
                Back
              </Button>
              <div className="flex gap-2">
                {onCancel && (
                  <Button onClick={onCancel} variant="outline" type="button">
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleSubmit(onSubmit)}
                  className="bg-blue-500 text-white px-8"
                  disabled={!selectedCityIds?.length}
                  type="button"
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button onClick={onBack} variant="outline" type="button">
                Back
              </Button>
              <Button 
                onClick={handleSubmit(onSubmit)}
                className="bg-blue-500 text-white px-8"
                disabled={!selectedCityIds?.length}
                type="button"
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 