"use client"

import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

interface TrainingCardProps {
  id: string
  title: string
  location: string
  duration: string
  ageGroup: string
}

export function TrainingCard({ 
  id,
  title, 
  location, 
  duration, 
  ageGroup, 
}: TrainingCardProps) {
  const router = useRouter()
  const params = useParams()

  const handleViewTraining = () => {
    router.push(`/${params.companyId}/training/${id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-custom border-[0.5px] border-[#E4E4E4] p-8 relative">
      <Button variant="ghost" size="icon" className="absolute right-4 top-4">
        <MoreVertical className="h-4 w-4 text-brand" />
      </Button>

      <h3 className="text-xl md:text-2xl font-semibold text-brand mb-4">
        {title}
      </h3>

      <div className="flex items-center gap-4 md:text-sm text-[11px] text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <img src="/location.svg" alt="" className="w-4 h-4" />
          {location}
        </div>
        <div className="flex items-center gap-1">
          <img src="/clock.svg" alt="" className="w-4 h-4" />
          {duration}
        </div>
        <div className="flex items-center gap-1">
          {/* <img src="/age.svg" alt="" className="w-4 h-4" /> */}
          {ageGroup}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        freestar Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Integer ultricies arcu vel urna rutrum, at dignissim leo ultricies.
        Nulla dignissim vel odio a scelerisque. Sed a tellus tincidunt, placerat
        elit sit amet, sollicitudin augue. Aenean ullamcorper sem ut sodales
        accumsan. Orci varius natoque penatibus et magnis dis parturient montes,
        nascetur ridiculus mus.
      </p>

      <div className="flex items-end justify-end py-3">
        <Button
          variant="link"
          className="text-brand hover:text-brand-primary p-0 h-auto font-medium text-sm md:text-md"
          onClick={handleViewTraining}
        >
          View training
          <img src="/rightArrow.svg" alt="" className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
} 