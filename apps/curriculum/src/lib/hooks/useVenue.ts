import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getCookie } from "@curriculum-services/auth";
import { toast } from "sonner";
import { useBaseData } from "./useBaseData";
import { City } from "./useStudents"; // Reusing City from useStudents



export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  question: string;
  equipmentItemType: "QUANTITATIVE" | "QUALITATIVE"; // Assuming these are the only types
  needStatusPercentage: number;
  mandatoryPercentage: number;
}

interface VenueRequirementDetail {
  equipmentItem: EquipmentItem;
  numericValue: number;
  remark: string;
  available: boolean;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  city: City;
  zone: string;
  woreda: string;
  latitude: number;
  longitude: number;
  venueRequirementList?: VenueRequirementDetail[]; // Optional for list view
}

interface VenuesResponse {
  code: string;
  venues: Venue[];
  message: string;

  totalPages?: number;
  pageSize?: number;
  currentPage?: number;
  totalElements?: number;
}

interface VenueResponse {
    code: string;
    venue: Venue;
    message: string;
}

// New interface for the equipment items list response
interface EquipmentItemsResponse {
  code: string;
  equipmentItems: EquipmentItem[];
  message: string;
}


// --- Interfaces for Mutations ---

export interface VenueRequirementInput {
  equipmentItemId: string;
  numericValue: number;
  remark: string;
  available: boolean;
}

export interface CreateVenueData {
  name: string;
  location: string;
  cityId: string;
  zone: string;
  woreda: string;
  latitude?: number; 
  longitude?: number; 
  venueRequirements?: VenueRequirementInput[];
  
  // Step 3: Venue Capacity fields
  seatingCapacity?: number;
  standingCapacity?: number;
  roomCount?: number;
  totalArea?: number;
  hasAccessibility?: boolean;
  accessibilityFeatures?: string;
  hasParkingSpace?: boolean;
  parkingCapacity?: number;
  
  // Step 4: Contact Information fields
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  availabilityNotes?: string;
  additionalInformation?: string;
  isActive?: boolean;
}

export type UpdateVenueData = Partial<CreateVenueData>;


const venueQueryKey = "venues";
const equipmentItemQueryKey = "equipmentItems"; // New query key

// Hook to fetch a list of venues with optional pagination.
export function useVenues(page?: number, pageSize?: number) {
  return useQuery({
    queryKey: [venueQueryKey, page, pageSize],
    queryFn: async (): Promise<VenuesResponse> => {
      try {
        const token = getCookie("token");
        let url = `${process.env.NEXT_PUBLIC_API}/venue`;

        const params = new URLSearchParams();
        if (page !== undefined) {
           const apiPage = page >= 0 ? page + 1 : 1;
           params.append("page", apiPage.toString());
        }
        if (pageSize !== undefined && pageSize > 0) { 
            params.append("page-size", pageSize.toString());
        }

 
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await axios.get<VenuesResponse>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });


        if (!response.data.venues) {
            response.data.venues = [];
        }

        return response.data;
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        throw new Error(error?.response?.data?.message || "Failed to load venues");
      }
    },
  });
}

// Hook to fetch a single venue by its ID.
export function useVenue(venueId: string) {
  return useQuery({
    queryKey: [venueQueryKey, venueId],
    queryFn: async (): Promise<VenueResponse> => {
      if (!venueId) {
        throw new Error("Venue ID is required");
      }
      try {
        const token = getCookie("token");
        const response = await axios.get<VenueResponse>(
          `${process.env.NEXT_PUBLIC_API}/venue/${venueId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data;
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        throw new Error(error?.response?.data?.message || "Failed to load venue details");
      }
    },
    enabled: !!venueId, // Only run query if venueId is provided
  });
}

/**
 * Hook to fetch a list of equipment items.
 */
export function useEquipmentItems() {
  return useQuery({
    queryKey: [equipmentItemQueryKey],
    queryFn: async (): Promise<EquipmentItem[]> => { // Return just the array
      try {
        const token = getCookie("token");
        const response = await axios.get<EquipmentItemsResponse>(
          `${process.env.NEXT_PUBLIC_API}/equipment-item`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Return only the items array, or an empty array if null/undefined
        return response.data.equipmentItems || [];
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        throw new Error(error?.response?.data?.message || "Failed to load equipment items");
      }
    },
     // Optional: Add staleTime if this data doesn't change often
     // staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for adding a new venue.
export function useAddVenue() {
  const queryClient = useQueryClient();
  const { data: cities } = useBaseData("city");
  // Fetch equipment items for use in the venue creation form/process
  const { data: equipmentItems } = useEquipmentItems(); 
  
  const addVenueMutation = useMutation({
    mutationFn: async (venueData: CreateVenueData) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/venue`,
        venueData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Venue added successfully");
      queryClient.invalidateQueries({ queryKey: [venueQueryKey] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to add venue");
    },
  });

  return {
    cities,
    equipmentItems, // Expose equipment items
    addVenue: addVenueMutation.mutate,
    isLoading: addVenueMutation.isPending,
    isSuccess: addVenueMutation.isSuccess,
    isError: addVenueMutation.isError,
    error: addVenueMutation.error,
  };
}

//Hook for updating an existing venue.
 
export function useUpdateVenue() {
  const queryClient = useQueryClient();

  const updateVenueMutation = useMutation({
    mutationFn: async ({
      venueId,
      venueData,
    }: {
      venueId: string;
      venueData: UpdateVenueData;
    }) => {
      const token = getCookie("token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/venue/${venueId}`,
        venueData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { responseData: response.data, venueId };
    },
    onSuccess: ({ venueId }) => {
      toast.success("Venue updated successfully");
      // Invalidate both the list and the specific venue query
      queryClient.invalidateQueries({ queryKey: [venueQueryKey] });
      queryClient.invalidateQueries({ queryKey: [venueQueryKey, venueId] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to update venue");
    },
  });

  return {
    updateVenue: updateVenueMutation.mutate,
    isLoading: updateVenueMutation.isPending,
    isSuccess: updateVenueMutation.isSuccess,
     isError: updateVenueMutation.isError,
    error: updateVenueMutation.error,
  };
}

// Hook for deleting a venue.
 
export function useDeleteVenue() {
  const queryClient = useQueryClient();

  const deleteVenueMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const token = getCookie("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/venue/${venueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Return the deleted venueId for potential use in onSuccess/onError
      return venueId;
    },
    onSuccess: (venueId) => {
      toast.success("Venue deleted successfully");
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: [venueQueryKey] });
      // Optional: Remove the specific venue query if it exists
      queryClient.removeQueries({ queryKey: [venueQueryKey, venueId] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to delete venue");
    },
  });

  return {
    deleteVenue: deleteVenueMutation.mutate,
    isLoading: deleteVenueMutation.isPending,
    isSuccess: deleteVenueMutation.isSuccess,
     isError: deleteVenueMutation.isError,
    error: deleteVenueMutation.error,
  };
}
