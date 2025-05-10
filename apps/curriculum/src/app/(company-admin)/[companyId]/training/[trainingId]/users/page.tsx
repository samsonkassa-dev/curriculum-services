"use client"

import { use } from "react"
import { useState } from "react"
import { trainingColumns } from "./components/columns"
import { TrainingDataTable } from "./components/data-table"
import { useTrainingUsersByTrainingId } from "@/lib/hooks/useFetchTrainingUsers"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus } from "lucide-react"
import { useInviteTrainingUser, RoleType } from "@/lib/hooks/useInviteTrainingUser";
import { useInviteTrainerAdmin } from "@/lib/hooks/useInviteTrainerAdmin";
import { InviteModal } from "../../create-training/components/modals/invite-modal";
import { useUserRole } from "@/lib/hooks/useUserRole";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQueryClient } from "@tanstack/react-query"


export default function TrainingUsersPage({ 
  params 
}: { 
  params: Promise<{ trainingId: string }> 
}) {
  const { trainingId } = use(params)
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [currentRoleType, setCurrentRoleType] = useState<RoleType | undefined>(undefined)

  // Get user role to determine available invite options
  const { isCompanyAdmin, isProjectManager } = useUserRole();

  // Invite user hook
  const { inviteUser, isLoading: isInviting } = useInviteTrainingUser();

  // Using the training-specific hook
  const { data, isLoading } = useTrainingUsersByTrainingId(trainingId)

  // Invite trainer admin hook
  const { inviteTrainerAdmin, isLoading: isInvitingTrainerAdmin } = useInviteTrainerAdmin();

  // Get available roles based on user role
  const getAvailableRoles = () => {
    if (isCompanyAdmin) {
      return [
        { value: RoleType.CURRICULUM_ADMIN, label: "Curriculum Admin" },
        { value: RoleType.PROJECT_MANAGER, label: "Project Manager" }
      ];
    } else if (isProjectManager) {
      return [
        { value: RoleType.TRAINING_ADMIN, label: "Training Admin" },
        { value: RoleType.TRAINER_ADMIN, label: "Trainer Admin" },
        { value: RoleType.ME_EXPERT, label: "ME Expert" }
      ];
    }
    // Default roles if none of the above
    return [
      { value: RoleType.CURRICULUM_ADMIN, label: "Curriculum Admin" }
    ];
  };

  // Handle role selection and open invite modal
  const handleRoleChange = (role: string) => {
    setCurrentRoleType(role as RoleType);
    setShowInviteModal(true);
  };

  // Invite user function
  const handleInvite = async (userEmail: string) => {
    if (!trainingId || !currentRoleType) return;

    if (currentRoleType === RoleType.TRAINER_ADMIN) {
      inviteTrainerAdmin(userEmail, () => {
        setShowInviteModal(false);
        // No need to invalidate query for trainer admin as it's company-level
      });
    } else {
      inviteUser(trainingId, userEmail, currentRoleType, () => {
        setShowInviteModal(false);
        // Invalidate and refetch the training users query
        queryClient.invalidateQueries({ queryKey: ['training-users', trainingId] });
      });
    }
  };

  const handleInviteModalClose = () => {
    setShowInviteModal(false);
  };

  // Client-side filtering and pagination
  const filteredUsers = data?.users.filter(user => 
    user?.firstName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    user?.lastName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    user?.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || []

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const totalElements = filteredUsers.length
  const totalPages = Math.ceil(totalElements / pageSize)

  return (
    <><div className="flex min-h-screen md:w-[calc(100%-85px)]  md:mx-auto w-full">
      <div className="flex-1 p-8 min-w-0">
        <h1 className="text-lg font-semibold mb-6">Training Users</h1>
        <div className="flex items-center lg:justify-end gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative md:w-[300px]">
              <Search className="absolute text-sm left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                className="pl-10 h-10 text-sm bg-white border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={currentRoleType || undefined}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="w-[250px] text-brand border-[0.3px] border-brand">
                  <SelectValue placeholder="Invite Admin" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles().map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TrainingDataTable
          columns={trainingColumns}
          data={paginatedUsers}
          isLoading={isLoading}
          pagination={{
            pageCount: totalPages,
            page,
            setPage,
            pageSize,
            setPageSize,
            showingText: totalElements > 0
              ? `Showing ${(page - 1) * pageSize + 1} to ${Math.min(
                page * pageSize,
                totalElements
              )} out of ${totalElements} records`
              : "No records to show",
          }} />
      </div>
    </div>
    <InviteModal
        isOpen={showInviteModal}
        onClose={handleInviteModalClose}
        onInvite={handleInvite}
        roleType={currentRoleType}
        isLoading={isInviting || isInvitingTrainerAdmin} /></>
  );
}