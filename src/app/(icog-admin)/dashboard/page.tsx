"use client";

// import { useAuth } from '@/hooks/useAuth';

export default function IcogAdminDashboard() {
  // const session = useAuth(); // Will redirect to login if not authenticated

  return (
    <div className="lg:px-16 md:px-14 px-4 py-10 flex min-h-screen w-full">
      <div className="flex flex-1 flex-col gap-4 pl-8">
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
