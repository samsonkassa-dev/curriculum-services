import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'

interface City {
  id: string
  name: string
  description: string
  country: {
    id: string
    name: string
    description: string
  }
}

interface CityResponse {
  code: string
  cities: City[]
  message: string
}

export function useCities(
  countryIds: string[], 
  options?: Omit<UseQueryOptions<City[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<City[], Error>({
    queryKey: ['cities', countryIds],
    queryFn: async () => {
      if (!countryIds.length) return []
      
      const queryString = countryIds
        .map(id => `country-ids=${id}`)
        .join('&')
      
      const { data } = await axios.get<CityResponse>(
        `${process.env.NEXT_PUBLIC_API}/city/country?${queryString}`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('auth_token')}` 
          }
        }
      )
      
      return data.cities
    },
    enabled: countryIds.length > 0,
    ...options
  })
} 