"use client";

import React, { useEffect } from "react";
import { UseFormReturn, useFieldArray, Controller } from "react-hook-form";
import { VenueSchema } from "./venue-schema";
import { EquipmentItem, useEquipmentItems } from "@/lib/hooks/useVenue";
import { useBaseData } from "@/lib/hooks/useBaseData";
import { City } from "@/lib/hooks/useStudents";
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
}: VenueWizardFormProps) {
  const { data: cities, isLoading: citiesLoading } = useBaseData("city");
  const { data: equipmentItems, isLoading: equipmentLoading } =
    useEquipmentItems();

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "venueRequirements",
  });

  useEffect(() => {
    if (equipmentItems && fields.length === 0 && !isLoading) {
      const initialRequirements = equipmentItems.map((item) => ({
        equipmentItemId: item.id,
        numericValue: undefined,
        remark: "",
        available: undefined,
      }));
      
      // Replace field array and mark as not dirty to avoid validation errors
      replace(initialRequirements);
      
      // Clear any validation errors for venueRequirements
      form.clearErrors('venueRequirements');
    }
  }, [equipmentItems, replace, fields.length, isLoading, form]);

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getEquipmentItemDetails = (id: string): EquipmentItem | undefined => {
    return equipmentItems?.find((item) => item.id === id);
  };

  const isStep1 = currentStep === 1;
  const isStep2 = currentStep === 2;
  const isStep3 = currentStep === 3;
  const isStep4 = currentStep === 4;
  const isLastStep = currentStep === steps.length;

  // Function to validate and go to next step
  const handleNextStep = async () => {
    let fieldsToValidate: (keyof VenueSchema)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'location', 'cityId', 'zone', 'woreda'];
    } else if (currentStep === 2) {
      // For step 2, we need to validate the venue requirements differently
      // Since requirements are dynamic, we'll skip detailed validation here
      // and just ensure the array exists
      form.clearErrors('venueRequirements');
      nextStep();
      return;
    } else if (currentStep === 3) {
      fieldsToValidate = ['seatingCapacity', 'roomCount', 'totalArea'];
    } else if (currentStep === 4) {
      fieldsToValidate = ['contactPerson', 'contactPhone'];
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
              <div className="space-y-8 p-4 border rounded-md bg-white">
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
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoading || citiesLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {citiesLoading && (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            )}
                            {cities?.map((city: City) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                            {!citiesLoading && !cities?.length && (
                              <SelectItem value="no-cities" disabled>
                                No cities found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zone / Sub-city</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter zone or sub-city"
                            disabled={isLoading}
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
                          />
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
                        <FormLabel>Woreda / Kebele</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter woreda or kebele"
                            disabled={isLoading}
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                                          className="mt-1 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                                            undefined,
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
                                            ? undefined
                                            : parseInt(val, 10)
                                        );
                                      }}
                                      value={numField.value ?? ""}
                                      placeholder="Enter quantity"
                                      disabled={isLoading || !showNumericInput}
                                      className="mt-1 w-1/2 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                        <FormLabel>Seating Capacity</FormLabel>
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
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                        <FormLabel>Number of Rooms</FormLabel>
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
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                        <FormLabel>Total Area (m²)</FormLabel>
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
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                                className="focus:ring-2 focus:ring-blue-500"
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
                                className="focus:ring-2 focus:ring-blue-500"
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
                              className="min-h-[80px] focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
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
                              className="w-1/2 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Information & Contact Details */}
            {isStep4 && (
              <div className="space-y-6 p-4 border rounded-md bg-white">
                <h3 className="text-lg font-semibold">Additional Information & Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Full name of contact person"
                            disabled={isLoading}
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
                          />
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
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Phone number"
                            disabled={isLoading}
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Email address"
                            disabled={isLoading}
                            className="focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            className="focus:ring-2 focus:ring-blue-500"
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
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="availabilityNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Special notes about venue availability, e.g., 'Available weekdays 9am-5pm'"
                              disabled={isLoading}
                              className="min-h-[80px] focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="additionalInformation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Any other relevant details about the venue"
                              disabled={isLoading}
                              className="min-h-[120px] focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFormSubmit}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Submitting..." : "Submit Venue"}
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}
