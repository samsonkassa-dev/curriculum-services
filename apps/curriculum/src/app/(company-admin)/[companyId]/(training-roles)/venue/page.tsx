"use client"

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useVenues, useDeleteVenue } from "@/lib/hooks/useVenue";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VenueList } from "./components/venue-list"; 
import { AddVenueDialog } from "./components/add-venue-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// TODO: Implement pagination controls
const DEFAULT_PAGE_SIZE = 20;

export default function VenuePage() {
    const router = useRouter();
    const params = useParams();
    const companyId = params.companyId as string;

    const [searchTerm, setSearchTerm] = useState("");
    const [page] = useState(0); // Pagination state (implement later)
    const [pageSize] = useState(DEFAULT_PAGE_SIZE); // Pagination state

    const [venueToDelete, setVenueToDelete] = useState<string | null>(null); // State for delete confirmation

    const { data, isLoading, error } = useVenues(page, pageSize);
    const { deleteVenue, isLoading: isDeleting } = useDeleteVenue();

    const venues = data?.venues || [];

    const handleEditVenue = (venueId: string) => {
        router.push(`/${companyId}/venue/${venueId}/edit`);
    };

    const confirmDeleteVenue = (venueId: string) => {
        setVenueToDelete(venueId);
    };

    const handleDelete = () => {
        if (venueToDelete) {
            deleteVenue(venueToDelete, {
                onSuccess: () => {
                    setVenueToDelete(null); // Close dialog on success
                    // Query invalidation is handled by the hook
                },
                onError: (err) => {
                    // Error toast is handled by the hook
                    console.error("Delete failed", err);
                    setVenueToDelete(null); // Close dialog on error too
                }
            });
        }
    };

    const filteredVenues = venues.filter(venue =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase())
        // TODO: Add more complex filtering based on other fields if needed
    );

    if (isLoading) {
        return <Loading />;
    }

    // Header section - consistent across all states
    const headerSection = (
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-semibold">Venues</h1>
            <div className="flex items-center gap-4">
                <div className="relative w-full md:w-auto min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search venues..."
                        className="pl-9 h-10 border border-[#D0D5DD] rounded-md text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Placeholder for filter button functionality */}
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-[#344054] h-10 whitespace-nowrap">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                </button>
                <AddVenueDialog 
                    companyId={companyId} 
                    trigger={
                        <Button
                            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2 h-10"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Venue</span>
                        </Button>
                    }
                    onSuccess={() => router.refresh()}
                />
            </div>
        </div>
    );

    if (error) {
        // Use toast for error notification as per hook design
        // Display a user-friendly message on the page
        return (
            <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8">
                {headerSection}
                <div className="text-center py-20 bg-gray-50 rounded-lg border">
                    <h3 className="text-lg font-medium mb-2">Error Loading Venues</h3>
                    <p className="text-gray-500 text-sm">
                        There was a problem loading the venues. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    if (!isLoading && venues.length === 0 && searchTerm === "") {
        return (
            <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8">
                {headerSection}
                <div className="text-center py-40 bg-gray-50 rounded-lg border">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Venues Added Yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by adding a new training venue.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8">
            {headerSection}
            <VenueList 
                venues={filteredVenues} 
                onEdit={handleEditVenue} 
                onDelete={confirmDeleteVenue} 
            />
            {/* TODO: Add pagination controls here based on data?.totalPages etc. */}

             {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!venueToDelete} onOpenChange={(open) => !open && setVenueToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the venue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
