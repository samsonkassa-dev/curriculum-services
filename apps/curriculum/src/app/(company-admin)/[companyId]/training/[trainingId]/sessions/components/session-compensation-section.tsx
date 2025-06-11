"use client"

import { useFormContext } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SessionFormValues } from "./session-schema"

export function SessionCompensationSection() {
  const {
    control,
    watch,
  } = useFormContext<SessionFormValues>()

  // Watch needed form values for conditional rendering
  const meetsRequirement = watch("meetsRequirement")
  const numberOfAssistantTrainer = watch("numberOfAssistantTrainer")
  const deliveryMethod = watch("deliveryMethod")

  return (
    <>
      {/* Venue Requirements (only for offline) */}
      {deliveryMethod === "OFFLINE" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FormField
              control={control}
              name="meetsRequirement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={Boolean(field.value)}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true)
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Meets venue requirements</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Check if the venue meets all training requirements
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {!meetsRequirement && (
            <FormField
              control={control}
              name="requirementRemark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirement Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Describe what requirements are not met..."
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      {/* Trainer Compensation */}
      <div className="space-y-4 mt-6">
        <Label className="text-base font-medium">Trainer Compensation</Label>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="trainerCompensationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compensation Type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PER_HOUR">Per Hour</SelectItem>
                      <SelectItem value="PER_TRAINEES">Per Trainee</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="trainerCompensationAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number(e.target.value)
                      field.onChange(isNaN(value) ? 0 : value)
                    }}
                    placeholder="Enter amount"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Assistant Trainer */}
      <div className="space-y-4 mt-6">
        <FormField
          control={control}
          name="numberOfAssistantTrainer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Assistant Trainers</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value)
                    field.onChange(isNaN(value) ? 0 : value)
                  }}
                  placeholder="Enter number of assistant trainers"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {numberOfAssistantTrainer > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Assistant Trainer Compensation</Label>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="assistantTrainerCompensationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compensation Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || "PER_HOUR"}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PER_HOUR">Per Hour</SelectItem>
                          <SelectItem value="PER_TRAINEES">Per Trainee</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="assistantTrainerCompensationAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : Number(e.target.value)
                          field.onChange(isNaN(value) ? 0 : value)
                        }}
                        placeholder="Enter amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
} 