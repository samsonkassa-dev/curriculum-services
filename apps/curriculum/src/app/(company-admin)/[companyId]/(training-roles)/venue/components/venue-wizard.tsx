import { useState, useEffect, memo, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"


import { venueSchema, VenueSchema } from "./venue-schema"
import { useAddVenue, useUpdateVenue, Venue, CreateVenueData, VenueResponse } from "@/lib/hooks/useVenue"
import { VenueWizardForm } from "./venue-wizard-form"

interface VenueWizardProps {
  companyId: string
  onSuccess: () => void
  onCancel: () => void
  venue?: Venue | null
  venueDetails?: VenueResponse
}

// Define step titles
const steps = [
  { id: 1, title: "General Details" },
  { id: 2, title: "Resource Availability" },
  { id: 3, title: "Venue Capacity & Features" },
];

const defaultValues: VenueSchema = {
  name: "",
  location: "",
  zoneId: "",
  cityId: "",
  woreda: "",
  latitude: undefined,
  longitude: undefined,
  venueRequirements: [],
  seatingCapacity: undefined,
  standingCapacity: undefined,
  roomCount: undefined,
  totalArea: undefined,
  hasAccessibility: false,
  accessibilityFeatures: "",
  hasParkingSpace: false,
  parkingCapacity: undefined,
  isActive: true,
}

type ZoneObj = { id?: string; region?: { id?: string; country?: { id?: string } } };

export const VenueWizard = memo(function VenueWizard({ 
  companyId, 
  onSuccess, 
  onCancel, 
  venue, 
  venueDetails 
}: VenueWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const { addVenue, isLoading: isAddingVenue } = useAddVenue()
  const { updateVenue, isLoading: isUpdatingVenue } = useUpdateVenue()
  
  const isLoading = isAddingVenue || isUpdatingVenue
  const isEditMode = !!venue

  // Derive initial region/country for edit mode
  const { initialCountryId, initialRegionId } = useMemo(() => {
    if (!venueDetails?.venue && !venue) return { initialCountryId: "", initialRegionId: "" };
    const venueData = venueDetails?.venue || venue!;
    let regionId = "";
    let countryId = "";
    if (venueData.zone) {
      const zoneObj = venueData.zone as ZoneObj;
      regionId = zoneObj.region?.id || "";
      countryId = zoneObj.region?.country?.id || "";
    }
    return { initialCountryId: countryId, initialRegionId: regionId };
  }, [venueDetails?.venue, venue]);

  // Initialize form with values based on edit or add mode
  const form = useForm<VenueSchema>({
    resolver: zodResolver(venueSchema),
    defaultValues: useMemo(() => {
      // Use detailed venue data if available, otherwise fall back to basic venue data
      const venueData = venueDetails?.venue || venue;
      
      if (!venueData) return defaultValues
      
      // Handle zone ID extraction - zone can be string or object
      let zoneId = "";
      if (venueData.zone) {
        if (typeof venueData.zone === 'string') {
          zoneId = venueData.zone;
        } else {
          zoneId = venueData.zone.id || "";
        }
      }
      
      return {
        name: venueData.name || "",
        location: venueData.location || "",
        zoneId,
        cityId: venueData.city?.id || "",
        woreda: venueData.woreda || "",
        latitude: venueData.latitude,
        longitude: venueData.longitude,
        venueRequirements: venueData.venueRequirementList?.map(req => ({
          equipmentItemId: req.equipmentItem.id,
          numericValue: req.numericValue,
          remark: req.remark || "",
          available: req.available,
        })) || [],
        seatingCapacity: venueData.seatingCapacity ?? undefined,
        standingCapacity: venueData.standingCapacity ?? undefined,
        roomCount: venueData.roomCount ?? undefined,
        totalArea: venueData.totalArea ?? undefined,
        hasAccessibility: venueData.hasAccessibility || false,
        accessibilityFeatures: venueData.accessibilityFeatures || "",
        hasParkingSpace: venueData.hasParkingSpace || false,
        parkingCapacity: venueData.parkingCapacity,
        isActive: venueData.isActive ?? true,
      }
    }, [venue, venueDetails]),
    mode: "onChange",
  })

  // Reset step when venue changes, but only when not in edit mode
  useEffect(() => {
    // If it's a new venue (not edit mode), reset to step 1
    // If editing an existing venue, don't reset the step
    if (!venue) {
      setCurrentStep(1)
    }
  }, [venue])

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Handle form submission
  const onSubmit = (values: VenueSchema) => {
    const formattedData: CreateVenueData = {
      name: values.name,
      location: values.location,
      zoneId: values.zoneId,
      cityId: values.cityId || undefined,
      woreda: values.woreda,
      latitude: values.latitude,
      longitude: values.longitude,
      venueRequirements: values.venueRequirements?.map(req => ({
        equipmentItemId: req.equipmentItemId,
        numericValue: req.numericValue ?? 0,
        remark: req.remark ?? '',
        available: req.available ?? false,
      })),
      hasAccessibility: values.hasAccessibility,
      hasParkingSpace: values.hasParkingSpace,
      isActive: values.isActive,
    } as CreateVenueData;

    // Only include capacity fields if they have values
    if (values.seatingCapacity !== undefined) formattedData.seatingCapacity = values.seatingCapacity;
    if (values.standingCapacity !== undefined) formattedData.standingCapacity = values.standingCapacity;
    if (values.roomCount !== undefined) formattedData.roomCount = values.roomCount;
    if (values.totalArea !== undefined) formattedData.totalArea = values.totalArea;
    if (values.accessibilityFeatures) formattedData.accessibilityFeatures = values.accessibilityFeatures;
    if (values.parkingCapacity !== undefined) formattedData.parkingCapacity = values.parkingCapacity;

    if (isEditMode && venue) {
      updateVenue({ venueId: venue.id, venueData: formattedData }, {
        onSuccess: () => {
          onSuccess()
        },
        onError: (error: unknown) => {
          console.error('Update venue failed:', error);
        }
      })
    } else {
      addVenue(formattedData, {
        onSuccess: () => {
          onSuccess()
        },
        onError: (error: unknown) => {
          console.error('Add venue failed:', error);
        }
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stepper UI */}
      <div className="mb-6 flex justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${ 
                currentStep > index + 1 ? 'bg-green-500 text-white' : 
                currentStep === index + 1 ? 'bg-blue-500 text-white' : 
                'bg-gray-200 text-gray-500'
              }`}
            >
              {step.id}
            </div>
            {index < steps.length - 1 && (
              <div className={`h-1 w-16 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200 '} mx-2`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Form Content Area */}
      <div className="flex-1 min-h-0">
        <VenueWizardForm
          companyId={companyId}
          form={form}
          currentStep={currentStep}
          steps={steps}
          nextStep={nextStep}
          prevStep={prevStep}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          isEditMode={isEditMode}
          initialCountryId={initialCountryId}
          initialRegionId={initialRegionId}
        />
      </div>
    </div>
  )
}) 