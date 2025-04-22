"use client"

import { UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StudentFormValues } from "./formSchemas"

interface AdditionalInfoFormProps {
  form: UseFormReturn<StudentFormValues>
  disabilities?: { id: string, name: string }[]
  marginalizedGroups?: { id: string, name: string }[]
}

export function AdditionalInfoForm({ 
  form, 
  disabilities = [], 
  marginalizedGroups = [] 
}: AdditionalInfoFormProps) {
  const watchHasDisability = form.watch("hasDisability")
  const watchBelongsToMarginalized = form.watch("belongsToMarginalizedGroup")

  return (
    <div className="space-y-8">
      {/* Has Disability Radio Question */}
      <FormField
        control={form.control}
        name="hasDisability"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you have any disabilities?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === 'true' ? true : value === 'false' ? false : null)}
                value={field.value === true ? 'true' : field.value === false ? 'false' : ''}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="true" />
                  </FormControl>
                  <FormLabel className="font-normal">Yes</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="false" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Conditional Disabilities Checkboxes */}
      {watchHasDisability === true && (
        <FormField
          control={form.control}
          name="disabilityIds"
          render={({ field }) => {
            return (
              <FormItem className="pl-4 border-l-2 border-gray-200">
                <div className="mb-4">
                  <FormLabel className="text-base">Please select disabilities:</FormLabel>
                </div>
                {disabilities.length > 0 ? disabilities.map((item) => (
                  <FormItem
                    key={item.id}
                    className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.id)}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          let updatedValue;
                          if (checked) {
                            updatedValue = [...currentValue, item.id];
                          } else {
                            updatedValue = currentValue.filter((value) => value !== item.id);
                          }
                          field.onChange(updatedValue);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {item.name}
                    </FormLabel>
                  </FormItem>
                )) : <p className="text-sm text-gray-500">No disabilities available to select.</p>}
                <FormMessage />
              </FormItem>
            )
          }}
        />
      )}

      {/* Belongs to Marginalized Group Radio Question */}
      <FormField
        control={form.control}
        name="belongsToMarginalizedGroup"
        render={({ field }) => (
          <FormItem className="space-y-3 pt-4">
            <FormLabel>Do you belong to any marginalized groups?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === 'true' ? true : value === 'false' ? false : null)}
                value={field.value === true ? 'true' : field.value === false ? 'false' : ''}
                className="flex space-x-4"
              >
                 <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="true" />
                  </FormControl>
                  <FormLabel className="font-normal">Yes</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="false" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Conditional Marginalized Groups Checkboxes */}
      {watchBelongsToMarginalized === true && (
        <FormField
          control={form.control}
          name="marginalizedGroupIds"
          render={({ field }) => {
            return (
              <FormItem className="pl-4 border-l-2 border-gray-200">
                <div className="mb-4">
                  <FormLabel className="text-base">Please select groups:</FormLabel>
                </div>
                {marginalizedGroups.length > 0 ? marginalizedGroups.map((item) => (
                   <FormItem
                    key={item.id}
                    className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.id)}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          let updatedValue;
                          if (checked) {
                            updatedValue = [...currentValue, item.id];
                          } else {
                            updatedValue = currentValue.filter((value) => value !== item.id);
                          }
                          field.onChange(updatedValue);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {item.name}
                    </FormLabel>
                  </FormItem>
                )) : <p className="text-sm text-gray-500">No marginalized groups available to select.</p>}
                <FormMessage />
              </FormItem>
            )
          }}
        />
      )}
    </div>
  )
} 