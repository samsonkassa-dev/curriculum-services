"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useTrainings, useUnarchiveTraining } from "@/lib/hooks/useTrainings"
import { TrainingCard } from "@/components/ui/training-card"
import { Loading } from "@/components/ui/loading"

export default function CompanyAdminArchive() {
  const router = useRouter()
  const params = useParams()
  const { data, isLoading } = useTrainings({ isArchived: true })
  const { isPending: isUnarchiving } = useUnarchiveTraining()

  const handleViewActiveTrainings = () => {
    router.push(`/${params.companyId}/training`)
  }

  if (isLoading || isUnarchiving) {
    return <Loading />
  }

  if (!data?.trainings?.length) {
    return (
      <div className="lg:px-16 md:px-14 px-4">
        <div className="rounded-lg p-12 text-center">
          <h1 className="text-2xl font-semibold mb-4">No Archived Trainings</h1>
          
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            You haven&apos;t archived any trainings yet. Archived trainings will appear here for future reference.
            You can archive trainings from the main training page by clicking the three dots menu on any training card.
          </p>

          <Button 
            onClick={handleViewActiveTrainings}
            className="bg-[#0B75FF] hover:bg-[#0052CC] text-white px-6 py-5"
          >
            View Active Trainings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full lg:px-16 md:px-14 px-4">
      <div className="flex-1 py-12 sm:pl-12">
        {/* <h1 className="text-2xl font-semibold mb-6">Archived Trainings</h1> */}
        
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {data.trainings.map((training) => (
            <TrainingCard
              key={training.id}
              id={training.id}
              title={training.title}
              location={training.cities[0]?.name || "N/A"}
              duration={`${training.duration} ${training.durationType.toLowerCase()}`}
              ageGroup={training.ageGroups[0]?.name || "N/A"}
              isArchived={true}
              rationale={training.rationale}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
