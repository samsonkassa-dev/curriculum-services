import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { StudentFormValues } from "./formSchemas"

interface EmergencyContactFormProps {
  form: UseFormReturn<StudentFormValues>
}

export function EmergencyContactForm({
  form,
}: EmergencyContactFormProps) {
  return (
    <div className="pb-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contact Name */}
        <FormField
          control={form.control}
          name="emergencyContactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Emergency Contact Name
              </FormLabel>
              <FormDescription className="text-gray-500 text-sm">
                Enter the name of your emergency contact.
              </FormDescription>
              <FormControl>
                <Input {...field} className="h-12 text-sm md:text-md" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Emergency Contact Phone */}
        <FormField
          control={form.control}
          name="emergencyContactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Emergency Contact Phone
              </FormLabel>
              <FormDescription className="text-gray-500 text-sm">
                Enter their phone number.
              </FormDescription>
              <div className="flex items-center gap-2">
                <div className="w-[142px] h-12 flex items-center px-4 border border-[#E4E4E4] rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">+251</span>
                  </div>
                </div>
                <FormControl>
                  <Input {...field} className="h-12 text-sm md:text-md" placeholder="911436785" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Emergency Contact Relationship */}
      <FormField
        control={form.control}
        name="emergencyContactRelationship"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Emergency Contact Relationship
            </FormLabel>
            <FormDescription className="text-gray-500 text-sm">
              Specify your relationship with the contact (e.g., Parent, Sibling,
              Friend).
            </FormDescription>
            <FormControl>
              <Input {...field} className="h-12 text-sm md:text-md" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 