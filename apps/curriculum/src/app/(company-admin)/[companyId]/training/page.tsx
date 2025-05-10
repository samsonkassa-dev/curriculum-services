"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useTrainings, useArchiveTraining } from "@/lib/hooks/useTrainings"
import { TrainingCard } from "@/components/ui/training-card"
import { Loading } from "@/components/ui/loading"
import { useEffect } from "react"
import { toast } from "sonner"
import { AlertCircle, RefreshCw } from "lucide-react"
import axios from "axios"
import { useUserRole } from "@/lib/hooks/useUserRole"

export default function CompanyAdminTraining() {
  const router = useRouter()
  const params = useParams()
  const { data, isLoading, error, refetch, } = useTrainings()
  const { isPending: isArchiving } = useArchiveTraining()
  const { isCompanyAdmin } = useUserRole()

  const handleCreateTraining = () => {
    router.push(`/${params.companyId}/training/create-training`)
  }

  // Show toast when there's an error
  useEffect(() => {
    if (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || "Failed to fetch trainings" 
        : "Failed to fetch trainings"
      toast.error("Error", { description: errorMessage })
    }
  }, [error])

  if (isLoading || isArchiving) {
    return <Loading />
  }

  // Show error UI when there's an error
  if (error && data?.trainings?.length === 0) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Failed to fetch trainings. Please try again later."
      : "Failed to fetch trainings. Please try again later."
      
    return (
      <div className="lg:px-16 md:px-14 px-4">
        <div className="rounded-lg p-12 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-4">Unable to Load Trainings</h1>
          
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
       We&apos;re having trouble connecting to the server. This could be due to a network issue or the server might be temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => refetch()}
              className="bg-[#0B75FF] hover:bg-[#0052CC] text-white px-6 py-5 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              onClick={() => router.push(`/${params.companyId}/dashboard`)}
              variant="outline"
              className="border-gray-300 text-gray-700 px-6 py-5"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state with create button only for company admin
  if (!data?.trainings?.length && isCompanyAdmin) {
    return (
      <div className="lg:px-16 md:px-14 px-4">
        <div className="rounded-lg p-12">
          <h1 className="text-2xl font-semibold mb-4">Training</h1>
          
          <p className="text-gray-600 mb-4">
            Creating and managing training programs is seamless with our user-friendly platform. Begin by setting clear objectives to ensure each
            curriculum aligns with your organizational goals. The platform allows you to assign a curriculum admin, who can then create and tailor
            the curriculum to meet specific needs, ensuring your training programs are focused and effective.
          </p>

          <p className="text-gray-600 mb-8">
            Additionally, by planning and organizing your training curricula through our intuitive interface, you can deliver impactful and well-structured 
            training programs that drive results and enhance learning experiences. The platform&apos;s flexibility enables you to adapt and evolve your 
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
      <div className="flex-1 py-12 sm:pl-12">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {data?.trainings?.map((training) => (
            <TrainingCard
              key={training.id}
              id={training.id}
              title={training.title}
              location={training.cities[0]?.name || "N/A"}
              duration={`${training.duration} ${training.durationType.toLowerCase()}`}
              ageGroup={training.ageGroups[0]?.name || "N/A"}
              rationale={training.rationale}
            />
          ))}
        </div>
      </div>
    </div>
  );
}