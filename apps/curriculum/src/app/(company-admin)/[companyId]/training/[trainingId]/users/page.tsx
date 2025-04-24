"use client"

import { use } from "react"
import { useState } from "react"
import { trainingColumns } from "./components/columns"
import { TrainingDataTable } from "./components/data-table"
import { useTrainingUsersByTrainingId } from "@/lib/hooks/useFetchTrainingUsers"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useInviteTrainingUser, RoleType } from "@/lib/hooks/useInviteTrainingUser";
import { InviteModal } from "../../create-training/components/modals/invite-modal";


export default function TrainingUsersPage({ 
  params 
}: { 
  params: Promise<{ trainingId: string }> 
}) {
  const { trainingId } = use(params)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [currentRoleType, setCurrentRoleType] = useState<RoleType>(RoleType.CURRICULUM_ADMIN)

  // Invite user hook
  const { inviteUser, isLoading: isInviting } = useInviteTrainingUser();

  // Using the training-specific hook
  const { data, isLoading } = useTrainingUsersByTrainingId(trainingId)

  // Open invite modal with specific role type
  const openInviteModal = (roleType: RoleType) => {
    setCurrentRoleType(roleType);
    setShowInviteModal(true);
  };

  // Invite user function
  const handleInvite = async (userEmail: string) => {
    if (!trainingId) return;

    inviteUser(trainingId, userEmail, currentRoleType, () => {
      setShowInviteModal(false);
    });
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
            <Button
              className="text-brand border-[0.3px] border-brand"
              variant="outline"
              onClick={() => openInviteModal(RoleType.CURRICULUM_ADMIN)}
            >
              Invite Curriculum Admin
            </Button>
            <Button
              className="text-brand border-[0.3px] border-brand"
              variant="outline"
              onClick={() => openInviteModal(RoleType.PROJECT_MANAGER)}
            >
              Invite Project Manager
            </Button>
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
        isLoading={isInviting} /></>
  );
}