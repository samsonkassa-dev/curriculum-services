import * as z from "zod";

// Schema for a single venue requirement, linked to an equipment item
const venueRequirementSchema = z.object({
  equipmentItemId: z.string(), // Hidden field, populated automatically
  numericValue: z.number().optional(),
  remark: z.string().optional().default(''), // Default to empty string if optional
  available: z.boolean().optional(),
}).optional();

// Step 3: Venue Capacity Schema
const venueCapacitySchema = z.object({
  seatingCapacity: z.number().min(1, "Seating capacity must be at least 1"),
  standingCapacity: z.number().min(0, "Standing capacity cannot be negative").optional(),
  roomCount: z.number().min(1, "Room count must be at least 1"),
  totalArea: z.number().min(1, "Total area must be at least 1 square meter"),
  hasAccessibility: z.boolean().optional(),
  accessibilityFeatures: z.string().optional(),
  hasParkingSpace: z.boolean().optional(),
  parkingCapacity: z.number().min(0, "Parking capacity cannot be negative").optional(),
});

// Step 4: Contact Information Schema
const contactInfoSchema = z.object({
  contactPerson: z.string().min(1, "Contact person name is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactEmail: z.string().email("Invalid email format").optional(),
  availabilityNotes: z.string().optional(),
  additionalInformation: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  location: z.string().min(1, "Location is required"),
  cityId: z.string().min(1, "City is required"),
  zone: z.string().min(1, "Zone is required"),
  woreda: z.string().min(1, "Woreda is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Add the array for venue requirements with more lenient validation
  venueRequirements: z.array(z.object({
    equipmentItemId: z.string(),
    numericValue: z.number().optional(),
    remark: z.string().optional().default(''),
    available: z.boolean().optional(),
  }).optional()).optional(),
  // Step 3: Venue Capacity fields
  seatingCapacity: z.number().min(1, "Seating capacity must be at least 1"),
  standingCapacity: z.number().min(0, "Standing capacity cannot be negative").optional(),
  roomCount: z.number().min(1, "Room count must be at least 1"),
  totalArea: z.number().min(1, "Total area must be at least 1 square meter"),
  hasAccessibility: z.boolean().optional(),
  accessibilityFeatures: z.string().optional(),
  hasParkingSpace: z.boolean().optional(),
  parkingCapacity: z.number().min(0, "Parking capacity cannot be negative").optional(),
  // Step 4: Contact Information fields
  contactPerson: z.string().min(1, "Contact person name is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactEmail: z.string().email("Invalid email format").optional(),
  availabilityNotes: z.string().optional(),
  additionalInformation: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type VenueSchema = z.infer<typeof venueSchema>;

// Type specifically for the requirement sub-schema if needed elsewhere
export type VenueRequirementSchema = z.infer<typeof venueRequirementSchema>;
export type VenueCapacitySchema = z.infer<typeof venueCapacitySchema>;
export type ContactInfoSchema = z.infer<typeof contactInfoSchema>; 