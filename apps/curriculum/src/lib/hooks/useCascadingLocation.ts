import { useBaseData } from './useBaseData'
import { useMemo } from 'react'

export function useCascadingLocation(options?: {
  selectedCountryIds?: string[]
  selectedRegionIds?: string[]
  selectedZoneIds?: string[]
}) {
  const { selectedCountryIds = [], selectedRegionIds = [], selectedZoneIds = [] } = options || {}

  // Always load countries (they're a manageable set)
  const { 
    data: countries, 
    isLoading: isLoadingCountries 
  } = useBaseData('country', {
    page: 1,
    pageSize: 50, // Most countries should fit in 50 items
    enabled: true
  })

  // Load regions for the first selected country (simplified approach)
  const firstCountryId = selectedCountryIds[0]
  const { 
    data: regions, 
    isLoading: isLoadingRegions 
  } = useBaseData('region', {
    countryId: firstCountryId,
    enabled: !!firstCountryId,
    page: 1,
    pageSize: 50
  })

  // Load zones for the first selected region
  const firstRegionId = selectedRegionIds[0]
  const { 
    data: zones, 
    isLoading: isLoadingZones 
  } = useBaseData('zone', {
    regionId: firstRegionId,
    enabled: !!firstRegionId,
    page: 1,
    pageSize: 100
  })

  // Load cities for the first selected zone
  const firstZoneId = selectedZoneIds[0]
  const { 
    data: cities, 
    isLoading: isLoadingCities 
  } = useBaseData('city', {
    zoneId: firstZoneId,
    enabled: !!firstZoneId,
    page: 1,
    pageSize: 200
  })

  return {
    countries: countries || [],
    regions: regions || [],
    zones: zones || [],
    cities: cities || [],
    isLoadingCountries,
    isLoadingRegions,
    isLoadingZones,
    isLoadingCities
  }
}

// Specialized hook for single selection (simpler use case)
export function useSingleCascadingLocation(countryId?: string, regionId?: string, zoneId?: string) {
  // Always load countries
  const { 
    data: countries, 
    isLoading: isLoadingCountries 
  } = useBaseData('country', {
    page: 1,
    pageSize: 50,
    enabled: true
  })

  // Load regions only if country is selected
  const { 
    data: regions, 
    isLoading: isLoadingRegions 
  } = useBaseData('region', {
    countryId,
    enabled: !!countryId,
    page: 1,
    pageSize: 50
  })

  // Load zones only if region is selected
  const { 
    data: zones, 
    isLoading: isLoadingZones 
  } = useBaseData('zone', {
    regionId,
    enabled: !!regionId,
    page: 1,
    pageSize: 100
  })

  // Load cities only if zone is selected
  const { 
    data: cities, 
    isLoading: isLoadingCities 
  } = useBaseData('city', {
    zoneId,
    enabled: !!zoneId,
    page: 1,
    pageSize: 200
  })

  return {
    countries: countries || [],
    regions: regions || [],
    zones: zones || [],
    cities: cities || [],
    isLoadingCountries,
    isLoadingRegions,
    isLoadingZones,
    isLoadingCities
  }
} 