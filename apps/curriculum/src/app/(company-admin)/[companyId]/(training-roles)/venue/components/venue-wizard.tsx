import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { venueSchema, VenueSchema } from "./venue-schema"
import { useAddVenue, CreateVenueData, VenueRequirementInput } from "@/lib/hooks/useVenue" // API hook for adding venues
import { VenueWizardForm } from "./venue-wizard-form"

interface VenueWizardProps {
  companyId: string
  onSuccess: () => void
  onCancel: () => void
}

// Define step titles or identifiers
const steps = [
  { id: 1, title: "General Details" },
  { id: 2, title: "Resource Availability" },
  { id: 3, title: "Venue Capacity & Features" },
  { id: 4, title: "Additional Information" },
]

export function VenueWizard({ companyId, onSuccess, onCancel }: VenueWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const { addVenue, isLoading: isAddingVenue } = useAddVenue()

  // Initialize react-hook-form
  const form = useForm<VenueSchema>({
    resolver: zodResolver(venueSchema), // Use the existing schema for now
    defaultValues: {
      name: "",
      location: "",
      cityId: "",
      zone: "",
      woreda: "",
      latitude: undefined,
      longitude: undefined,
      venueRequirements: [], // Initialize requirements array
      // Step 3 fields
      seatingCapacity: undefined,
      standingCapacity: undefined,
      roomCount: undefined,
      totalArea: undefined,
      hasAccessibility: false,
      accessibilityFeatures: "",
      hasParkingSpace: false,
      parkingCapacity: undefined,
      // Step 4 fields
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      availabilityNotes: "",
      additionalInformation: "",
      isActive: true,
    },
    mode: "onChange", // Validate on change for better UX
  })

  // Navigation functions
  const nextStep = async () => {
    // Validate only fields for the current step
    let fieldsToValidate: (keyof VenueSchema)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'location', 'cityId', 'zone', 'woreda'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['venueRequirements'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['seatingCapacity', 'roomCount', 'totalArea'];
    } else if (currentStep === 4) {
      fieldsToValidate = ['contactPerson', 'contactPhone'];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Handle final submission
  const onSubmit = (values: VenueSchema) => {
    console.log("Submitting Venue Data:", values) // Log data for development
    
    // Format the data according to the API expectations
    const formattedData: CreateVenueData = {
      // Step 1: General Details
      name: values.name,
      location: values.location,
      cityId: values.cityId,
      zone: values.zone,
      woreda: values.woreda,
      latitude: values.latitude,
      longitude: values.longitude,
      
      // Step 2: Resource Availability
      venueRequirements: values.venueRequirements?.filter((req): req is NonNullable<typeof req> => 
        req !== undefined && req !== null
      ).map(req => ({
        equipmentItemId: req.equipmentItemId,
        numericValue: req.numericValue ?? 0, // Ensure a number is provided, default to 0 if undefined
        remark: req.remark ?? '',
        available: req.available ?? false, // Default to false if undefined
      })),
      
      // Step 3: Venue Capacity & Features
      seatingCapacity: values.seatingCapacity,
      standingCapacity: values.standingCapacity,
      roomCount: values.roomCount,
      totalArea: values.totalArea,
      hasAccessibility: values.hasAccessibility,
      accessibilityFeatures: values.accessibilityFeatures,
      hasParkingSpace: values.hasParkingSpace,
      parkingCapacity: values.parkingCapacity,
      
      // Step 4: Contact Information & Additional Details
      contactPerson: values.contactPerson,
      contactPhone: values.contactPhone,
      contactEmail: values.contactEmail,
      availabilityNotes: values.availabilityNotes,
      additionalInformation: values.additionalInformation,
      isActive: values.isActive,
    };
    
    // The toast is already handled in the useAddVenue hook
    addVenue(formattedData, {
      onSuccess: () => {
        // Navigate away or reset form instead of duplicating toast
        onSuccess()
      },
      onError: (error) => {
        // Log error but don't show toast (handled by hook)
        console.log(error)
      }
    })
  }

  return (
    <div className="flex flex-col h-full"> {/* Ensure wizard takes height */}
      {/* Stepper UI (Placeholder) */}
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
              <div className={`h-1 w-16 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'} mx-2`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Form Content Area */}
      <div className="flex-grow overflow-y-auto pr-2 h-full"> {/* Ensure form area takes height */}
        <VenueWizardForm
          form={form} 
          currentStep={currentStep}
          steps={steps} // Pass steps info
          nextStep={nextStep}
          prevStep={prevStep}
          onSubmit={onSubmit} // Pass the handler
          onCancel={onCancel}
          isLoading={isAddingVenue}
          companyId={companyId} // Pass if needed for fetches within form
        />
      </div>
    </div>
  )
} 