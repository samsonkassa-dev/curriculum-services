import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { City } from "@/lib/hooks/useStudents"
import { StudentFormValues } from "./formSchemas"
import { useEffect } from "react"

interface ContactInfoFormProps {
  form: UseFormReturn<StudentFormValues>
  cities?: City[]
}

export function ContactInfoForm({ form, cities }: ContactInfoFormProps) {
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
                <Input {...field} className="h-12 text-sm md:text-md" />
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">City/Town</FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Select or enter the city or town where you are located.
                </FormDescription>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                  key={`city-select-${field.value || 'empty'}`}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-sm md:text-md select-trigger">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities?.map(city => (
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
          
          <FormField
            control={form.control}
            name="subCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Subcity</FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Select or enter the subcity within the city/town.
                </FormDescription>
                <FormControl>
                  <Input {...field} className="h-12 text-sm md:text-md" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormField
            control={form.control}
            name="woreda"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Woreda/Kebele</FormLabel>
                <FormDescription className="text-gray-500 text-sm">
                  Select or enter the woreda or kebele within the subcity.
                </FormDescription>
                <FormControl>
                  <Input {...field} className="h-12 text-sm md:text-md" />
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
                  <Input {...field} className="h-12 text-sm md:text-md" />
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