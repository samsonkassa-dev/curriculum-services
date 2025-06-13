"use client"

import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useVenue } from "@/lib/hooks/useVenue"
import { Loading } from "@/components/ui/loading"

interface VenueDetailModalProps {
  venueId: string
  open: boolean
  onClose: () => void
}

export function VenueDetailModal({ venueId, open, onClose }: VenueDetailModalProps) {
  const { data, isLoading, error } = useVenue(venueId)

  if (!open) return null

  const venue = data?.venue

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Venue Information</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        {isLoading ? (
          <div className="py-10 flex justify-center"><Loading /></div>
        ) : error || !venue ? (
          <div className="py-10 text-center text-red-600">Failed to load venue details.</div>
        ) : (
          <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-8 py-6 space-y-4">
            <div className="flex justify-between border-b py-3">
              <span className="text-gray-600">Name</span>
              <span>{venue.name}</span>
            </div>
            <div className="flex justify-between border-b py-3">
              <span className="text-gray-600">Location</span>
              <span>{venue.location}</span>
            </div>
            <div className="flex justify-between border-b py-3">
              <span className="text-gray-600">City</span>
              <span>{venue.city?.name || "-"}</span>
            </div>
            <div className="flex justify-between border-b py-3">
              <span className="text-gray-600">Zone</span>
              <span>{typeof venue.zone === "string" ? venue.zone : venue.zone?.name}</span>
            </div>
            <div className="flex justify-between border-b py-3">
              <span className="text-gray-600">Woreda</span>
              <span>{venue.woreda}</span>
            </div>
            <div className="flex justify-between border-b py-3">
              <span className="text-gray-600">Latitude / Longitude</span>
              <span>{venue.latitude ?? "-"} / {venue.longitude ?? "-"}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Seating Capacity</span>
              <span>{venue.seatingCapacity ?? "-"}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Standing Capacity</span>
              <span>{venue.standingCapacity ?? "-"}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Room Count</span>
              <span>{venue.roomCount ?? "-"}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Total Area (m²)</span>
              <span>{venue.totalArea ?? "-"}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Accessibility</span>
              <span>{venue.hasAccessibility ? "Yes" : "No"}</span>
            </div>
            {venue.accessibilityFeatures && (
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Accessibility Features</span>
                <span>{venue.accessibilityFeatures}</span>
              </div>
            )}
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Parking Space</span>
              <span>{venue.hasParkingSpace ? `Yes (${venue.parkingCapacity ?? 0})` : "No"}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 