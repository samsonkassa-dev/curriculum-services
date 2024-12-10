"use client";

// import { useAuth } from '@/hooks/useAuth';

export default function IcogAdminDashboard() {
  // const session = useAuth(); // Will redirect to login if not authenticated

  return (
    <div className="flex min-h-screen w-[calc(100%-85px)] pl-[85px] mx-auto">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/90" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>

        <div className=" flex-1 rounded-xl bg-muted md:min-h-min" />
      </div>
    </div>
  );
}
