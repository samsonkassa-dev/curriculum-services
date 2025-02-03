"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useTrainings } from "@/lib/hooks/useTrainings"
import { TrainingCard } from "@/components/ui/training-card"
import { Loading } from "@/components/ui/loading"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"

export default function CompanyAdminTraining() {
  const router = useRouter()
  const params = useParams()
  const { data, isLoading } = useTrainings()

  const handleCreateTraining = () => {
    router.push(`/${params.companyId}/training/create-training`)
  }

  if (isLoading) {
    return <Loading />
  }

  if (!data?.trainings?.length) {
    return (
      <div className="md:w-[calc(100%-85px)] md:pl-[65px] px-[10px] mx-auto">
        <div className="rounded-lg p-12">
          <h1 className="text-2xl font-semibold mb-4">Create Training</h1>
          
          <p className="text-gray-600 mb-4">
            Creating and managing training programs is seamless with our user-friendly platform. Begin by setting clear objectives to ensure each
            curriculum aligns with your organizational goals. The platform allows you to assign a curriculum admin, who can then create and tailor
            the curriculum to meet specific needs, ensuring your training programs are focused and effective.
          </p>

          <p className="text-gray-600 mb-8">
            Additionally, by planning and organizing your training curricula through our intuitive interface, you can deliver impactful and well-structured 
            training programs that drive results and enhance learning experiences. The platforms flexibility enables you to adapt and evolve your 
            training content effortlessly, keeping your organization at the forefront of industry standards.
          </p>

          <Button 
            onClick={handleCreateTraining}
            className="bg-[#0B75FF] hover:bg-[#0052CC] text-white px-6 py-5"
          >
            Create Training
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full lg:px-16 md:px-14 px-4">
      <div className="flex-1 py-12 sm:pl-8">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {data.trainings.map((training) => (
            <TrainingCard
              key={training.id}
              id={training.id}
              title={training.title}
              location={training.cities[0]?.name || "N/A"}
              duration={`${
                training.duration
              } ${training.durationType.toLowerCase()}`}
              ageGroup={training.ageGroups[0]?.name || "N/A"}
              // description={training.trainingPurposes[0]?.description || 'No description available'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}