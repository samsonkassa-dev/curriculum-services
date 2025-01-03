"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function CompanyAdminTraining() {
  const router = useRouter()
  const params = useParams()

  const handleCreateTraining = () => {
    router.push(`/${params.companyId}/training/create-training`)
  }

  return (
    <div className="w-[calc(100%-85px)] pl-[65px] mx-auto">
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