import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { StudentFormValues } from "./formSchemas"
import { useEffect, useMemo } from "react"

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

interface ContactInfoFormProps {
  form: UseFormReturn<StudentFormValues>
  countries?: Country[]
  regions?: Region[]
  zones?: Zone[]
  cities?: City[]
}

export function ContactInfoForm({ form, countries, regions, zones, cities }: ContactInfoFormProps) {
  const selectedCountryId = form.watch('countryId') || '';
  const selectedRegionId = form.watch('regionId') || '';
  const selectedZoneId = form.watch('zoneId') || '';
  
  // Filter regions based on selected country
  const availableRegions = useMemo(() => {
    if (!selectedCountryId || !regions) return [];
    return regions.filter((region: Region) => 
      region.country.id === selectedCountryId
    );
  }, [regions, selectedCountryId]);
  
  // Filter zones based on selected region
  const availableZones = useMemo(() => {
    if (!selectedRegionId || !zones) return [];
    return zones.filter((zone: Zone) => 
      zone.region.id === selectedRegionId
    );
  }, [zones, selectedRegionId]);
  
  // Filter cities based on selected zone
  const availableCities = useMemo(() => {
    if (!selectedZoneId || !cities) return [];
    return cities.filter((city: City) => 
      city.zone && city.zone.id === selectedZoneId
    );
  }, [cities, selectedZoneId]);

  const handleSelectCountry = (countryId: string) => {
    form.setValue('countryId', countryId, { shouldValidate: true });
    // Clear dependent selections
    form.setValue('regionId', '', { shouldValidate: true });
    form.setValue('zoneId', '', { shouldValidate: true });
    form.setValue('cityId', '', { shouldValidate: true });
  };

  const handleSelectRegion = (regionId: string) => {
    form.setValue('regionId', regionId, { shouldValidate: true });
    // Clear dependent selections
    form.setValue('zoneId', '', { shouldValidate: true });
    form.setValue('cityId', '', { shouldValidate: true });
  };

  const handleSelectZone = (zoneId: string) => {
    form.setValue('zoneId', zoneId, { shouldValidate: true });
    // Clear dependent selections
    form.setValue('cityId', '', { shouldValidate: true });
  };

  const handleSelectCity = (cityId: string) => {
    form.setValue('cityId', cityId, { shouldValidate: true });
  };

  // Format phone number to include country code on form submission
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      // Check if the field being changed is the phone number
      if (name === 'contactPhone') {
        const phoneValue = values.contactPhone;
        if (phoneValue && typeof phoneValue === 'string') {
          // If the phone number already includes +251, leave it as is
          if (!phoneValue.startsWith('+251')) {
            // Remove any existing '+251' prefix to avoid duplicates
            const cleanedNumber = phoneValue.replace(/^\+251/, '');
            
            // Save the full number with country code in form data
            // but don't update the field value to maintain a good UX
            form.setValue('contactPhone', `+251${cleanedNumber}`);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="pb-8">
      {/* Email and Phone section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormDescription className="text-gray-500 text-sm">
                Enter your email address
              </FormDescription>
              <FormControl>
                <Input {...field} value={field.value || ""} className="h-12 text-sm md:text-md" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Contact Phone</FormLabel>
              <FormDescription className="text-gray-500 text-sm">
                Enter your contact number.
              </FormDescription>
              <div className="flex items-center gap-2">
                <div className="w-[142px] h-12 flex items-center px-4 border border-[#E4E4E4] rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">+251</span>
                  </div>
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    className="h-12 text-sm md:text-md" 
                    placeholder="911436785"
                    // Display only the local part without the +251 prefix
                    value={field.value?.toString().replace(/^\+251/, '') || ''}
                    onChange={(e) => {
                      // Only allow numeric input
                      const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                      field.onChange(onlyNums);
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Address section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-6">Address</h3>
        
        {/* Country and Region */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormField
            control={form.control}
            name="countryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Country <span className="text-red-500">*</span></FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Select your country
                </FormDescription>
                <Select 
                  onValueChange={handleSelectCountry} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-sm md:text-md select-trigger">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries?.map(country => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="regionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Region <span className="text-red-500">*</span></FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Select your region
                </FormDescription>
                <Select 
                  onValueChange={handleSelectRegion} 
                  value={field.value || undefined}
                  disabled={!selectedCountryId}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-sm md:text-md select-trigger">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableRegions.map(region => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Zone and City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormField
            control={form.control}
            name="zoneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Zone <span className="text-red-500">*</span></FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Select your zone
                </FormDescription>
                <Select 
                  onValueChange={handleSelectZone} 
                  value={field.value || undefined}
                  disabled={!selectedRegionId}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-sm md:text-md select-trigger">
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableZones.map(zone => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">City/Town <span className="text-red-500">*</span></FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Select your city or town
                </FormDescription>
                <Select 
                  onValueChange={handleSelectCity} 
                  value={field.value || undefined}
                  disabled={!selectedZoneId}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-sm md:text-md select-trigger">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Subcity, Woreda, and House Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="subCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Subcity</FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Enter the subcity within the city/town.
                </FormDescription>
                <FormControl>
                  <Input {...field} value={field.value || ""} className="h-12 text-sm md:text-md" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="woreda"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Woreda/Kebele</FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Enter the woreda or kebele within the subcity.
                </FormDescription>
                <FormControl>
                  <Input {...field} value={field.value || ""} className="h-12 text-sm md:text-md" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="houseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">House Number</FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Enter your house number or building name
                </FormDescription>
                <FormControl>
                  <Input {...field} value={field.value || ""} className="h-12 text-sm md:text-md" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
} 