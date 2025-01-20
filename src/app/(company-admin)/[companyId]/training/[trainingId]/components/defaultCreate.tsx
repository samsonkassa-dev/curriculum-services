import { Button } from "@/components/ui/button";

interface DefaultCreateProps {
  title: string
  trainingId: string
  onCreateClick: () => void
}

export function DefaultCreate({ title, trainingId, onCreateClick }: DefaultCreateProps) {
  return (
    <div className="md:w-[calc(100%-85px)] md:pl-[65px] px-[10px] mx-auto">
      <div className="rounded-lg p-12">
        <h1 className="text-2xl font-semibold mb-4">{title}</h1>

        <p className="text-gray-600 mb-4">
          Creating and managing training programs is seamless with our
          user-friendly platform. Begin by setting clear objectives to ensure
          each curriculum aligns with your organizational goals.
        </p>

        <p className="text-gray-600 mb-8">
          Additionally, by planning and organizing your training curricula
          through our intuitive interface, you can deliver impactful and
          well-structured training programs that drive results and enhance
          learning experiences.
        </p>

        <Button
          onClick={onCreateClick}
          className="bg-brand hover:bg-[#0052CC] text-white px-6 py-5"
        >
         {title}
        </Button>
      </div>
    </div>
  );
}
