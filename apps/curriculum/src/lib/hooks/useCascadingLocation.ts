import { useQuery } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { getCookie } from '@curriculum-services/auth'
import { toast } from 'sonner'
import { useBaseData } from './useBaseData'

// API Response interfaces to match existing component expectations
interface RegionResponse {
  code: string
  message: string
  regions: Array<{
    id: string
    name: string
    description: string
    country: {
      id: string
      name: string
      description: string
    }
  }>
}

interface ZoneResponse {
  code: string
  message: string
  zones: Array<{
    id: string
    name: string
    description: string
    region: {
      id: string
      name: string
      description: string
      country: {
        id: string
        name: string
        description: string
      }
    }
  }>
}

interface CityResponse {
  code: string
  message: string
  cities: Array<{
    id: string
    name: string
    description: string
    zone: {
      id: string
      name: string
      description: string
      region: {
        id: string
        name: string
        description: string
        country: {
          id: string
          name: string
          description: string
        }
      }
    }
  }>
}

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Hook for fetching regions by country IDs
function useRegionsByCountries(countryIds: string[], enabled: boolean = true) {
  return useQuery({
    queryKey: ['cascading-regions', countryIds],
    queryFn: async () => {
      if (!countryIds.length) return []
      
      const token = getCookie('token')
      const queryString = countryIds
        .map(id => `country-ids=${id}`)
        .join('&')
      
      try {
        const response = await api.get<RegionResponse>(
          `/region/country?${queryString}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.regions || []
      } catch (error) {
        const axiosError = error as AxiosError
        const statusCode = axiosError.response?.status
        
        if (statusCode === 401) {
          toast.error('Your session has expired. Please log in again.')
        } else if (statusCode === 403) {
          toast.error('You do not have permission to access this data.')
        } else if (statusCode === 404) {
          toast.error('Region data not found.')
        } else {
          toast.error(`Error fetching region data: ${axiosError.message}`)
        }
        throw error
      }
    },
    enabled: enabled && countryIds.length > 0,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  })
}

// Hook for fetching zones by region IDs
function useZonesByRegions(regionIds: string[], enabled: boolean = true) {
  return useQuery({
    queryKey: ['cascading-zones', regionIds],
    queryFn: async () => {
      if (!regionIds.length) return []
      
      const token = getCookie('token')
      const queryString = regionIds
        .map(id => `region-ids=${id}`)
        .join('&')
      
      try {
        const response = await api.get<ZoneResponse>(
          `/zone/region?${queryString}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.zones || []
      } catch (error) {
        const axiosError = error as AxiosError
        const statusCode = axiosError.response?.status
        
        if (statusCode === 401) {
          toast.error('Your session has expired. Please log in again.')
        } else if (statusCode === 403) {
          toast.error('You do not have permission to access this data.')
        } else if (statusCode === 404) {
          toast.error('Zone data not found.')
        } else {
          toast.error(`Error fetching zone data: ${axiosError.message}`)
        }
        throw error
      }
    },
    enabled: enabled && regionIds.length > 0,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  })
}

// Hook for fetching cities by zone IDs
function useCitiesByZones(zoneIds: string[], enabled: boolean = true) {
  return useQuery({
    queryKey: ['cascading-cities', zoneIds],
    queryFn: async () => {
      if (!zoneIds.length) return []
      
      const token = getCookie('token')
      const queryString = zoneIds
        .map(id => `zone-ids=${id}`)
        .join('&')
      
      try {
        const response = await api.get<CityResponse>(
          `/city/zone?${queryString}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.cities || []
      } catch (error) {
        const axiosError = error as AxiosError
        const statusCode = axiosError.response?.status
        
        if (statusCode === 401) {
          toast.error('Your session has expired. Please log in again.')
        } else if (statusCode === 403) {
          toast.error('You do not have permission to access this data.')
        } else if (statusCode === 404) {
          toast.error('City data not found.')
        } else {
          toast.error(`Error fetching city data: ${axiosError.message}`)
        }
        throw error
      }
    },
    enabled: enabled && zoneIds.length > 0,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  })
}

// Main hook - supports multiple selections (maintains exact same interface as original)
export function useCascadingLocation(options?: {
  selectedCountryIds?: string[]
  selectedRegionIds?: string[]
  selectedZoneIds?: string[]
}) {
  const { selectedCountryIds = [], selectedRegionIds = [], selectedZoneIds = [] } = options || {}

  // Always load countries using the existing useBaseData hook (no change here)
  const { 
    data: countries, 
    isLoading: isLoadingCountries 
  } = useBaseData('country', {
    page: 1,
    pageSize: 50,
    enabled: true
  })

  // Load regions for selected countries using new cascading endpoint
  const { 
    data: regions, 
    isLoading: isLoadingRegions 
  } = useRegionsByCountries(selectedCountryIds, selectedCountryIds.length > 0)

  // Load zones for selected regions using new cascading endpoint
  const { 
    data: zones, 
    isLoading: isLoadingZones 
  } = useZonesByRegions(selectedRegionIds, selectedRegionIds.length > 0)

  // Load cities for selected zones using new cascading endpoint
  const { 
    data: cities, 
    isLoading: isLoadingCities 
  } = useCitiesByZones(selectedZoneIds, selectedZoneIds.length > 0)

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

// Specialized hook for single selection (maintains exact same interface as original)
export function useSingleCascadingLocation(countryId?: string, regionId?: string, zoneId?: string) {
  // Always load countries using the existing useBaseData hook (no change here)
  const { 
    data: countries, 
    isLoading: isLoadingCountries 
  } = useBaseData('country', {
    page: 1,
    pageSize: 50,
    enabled: true
  })

  // Load regions only if country is selected using new cascading endpoint
  const { 
    data: regions, 
    isLoading: isLoadingRegions 
  } = useRegionsByCountries(countryId ? [countryId] : [], !!countryId)

  // Load zones only if region is selected using new cascading endpoint
  const { 
    data: zones, 
    isLoading: isLoadingZones 
  } = useZonesByRegions(regionId ? [regionId] : [], !!regionId)

  // Load cities only if zone is selected using new cascading endpoint
  const { 
    data: cities, 
    isLoading: isLoadingCities 
  } = useCitiesByZones(zoneId ? [zoneId] : [], !!zoneId)

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