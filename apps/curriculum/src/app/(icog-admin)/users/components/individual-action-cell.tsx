/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IndividualUser } from "@/types/users";
import { useProfile } from "@/lib/hooks/useProfile";
import { DeactivateModal } from "@/components/modals/deactivate-modal";

export function IndividualActionCell({ row }: { row: any }) {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const item = row.original as IndividualUser;
  const { DeactivateUser, ActivateUser } = useProfile();

  const handleDeactivateUser = async () => {
    DeactivateUser.mutate(item.id);
    setShowDeactivateModal(false);
  };

  const handleActivateUser = async () => {
    ActivateUser.mutate(item.id);
  };

  return (
    <>
      {item.deactivated ? (
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 text-green-500"
          onClick={handleActivateUser}
        >
          <span className="sr-only">Activate User</span>
          <img src="/activate.svg" alt="Activate" className="w-5 h-5" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 text-red-500"
          onClick={() => setShowDeactivateModal(true)}
        >
          <span className="sr-only">Deactivate User</span>
          <img src="/deactivate.svg" alt="Deactivate" className="w-5 h-5" />
        </Button>
      )}
      <DeactivateModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onDeactivate={handleDeactivateUser}
      />
    </>
  );
}
