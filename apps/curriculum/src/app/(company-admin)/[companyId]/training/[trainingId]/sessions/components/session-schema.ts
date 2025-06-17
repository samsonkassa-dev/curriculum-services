import { z } from "zod"
import { CompensationType, DeliveryMethod } from "@/lib/hooks/useSession"

// Time options
export const timeOptions = [
  "6:00 AM", "6:30 AM",
  "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM",
  "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"
]

// Form schema
export const sessionSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  lessonIds: z.array(z.string()).min(1, "At least one lesson is required"),
  deliveryMethod: z.enum(["OFFLINE", "ONLINE", "SELF_PACED"] as const),
  startDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.date(),
  endTime: z.string().min(1, "End time is required"),
  numberOfStudents: z.coerce.number().min(1, "Number of students is required"),
  trainingVenueId: z.string().optional(),
  meetsRequirement: z.boolean(),
  requirementRemark: z.string().optional(),
  trainerCompensationType: z.enum(["PER_HOUR", "PER_TRAINEES", "PER_SESSION"] as const),
  trainerCompensationAmount: z.coerce.number().min(1, "Compensation amount is required"),
  numberOfAssistantTrainer: z.coerce.number().min(0),
  assistantTrainerCompensationType: z.enum(["PER_HOUR", "PER_TRAINEES", "PER_SESSION"] as const).optional(),
  assistantTrainerCompensationAmount: z.coerce.number().optional(),
  trainingLink: z.string().optional(),
  isFirst: z.boolean().default(false),
  isLast: z.boolean().default(false),
}).refine((data) => {
  // If delivery method is OFFLINE, trainingVenueId is required
  if (data.deliveryMethod === "OFFLINE") {
    return !!data.trainingVenueId;
  }
  return true;
}, {
  message: "Training venue is required for offline sessions",
  path: ["trainingVenueId"]
}).refine((data) => {
  // Validate that end date/time is after start date/time
  const formatDateForValidation = (date: Date): string => {
    const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return adjustedDate.toISOString().split("T")[0]
  }
  
  const startDateTime = new Date(`${formatDateForValidation(data.startDate)}T${data.startTime}`);
  const endDateTime = new Date(`${formatDateForValidation(data.endDate)}T${data.endTime}`);
  return endDateTime > startDateTime;
}, {
  message: "End date and time must be after start date and time",
  path: ["endTime"]
});

export type SessionFormValues = z.infer<typeof sessionSchema>

// Custom interface for creating a session
export interface CustomCreateSessionData {
  name: string;
  lessonIds: string[];
  deliveryMethod: DeliveryMethod;
  startDate: string;
  endDate: string;
  numberOfStudents: number;
  trainingVenueId: string;
  meetsRequirement: boolean;
  requirementRemark: string;
  trainerCompensationType: CompensationType;
  trainerCompensationAmount: number;
  numberOfAssistantTrainer: number;
  assistantTrainerCompensationType: CompensationType;
  assistantTrainerCompensationAmount: number;
  trainingLink?: string;
  isFirst: boolean;
  isLast: boolean;
} 