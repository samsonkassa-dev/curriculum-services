import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface VerificationStatusProps {
  status: 'PENDING' | 'REJECTED';
  rejectionReason?: string;
}

export function VerificationStatus({ status, rejectionReason }: VerificationStatusProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <img 
        src={status === 'PENDING' ? "/underReview.svg" : "/rejected.svg"}
        alt="Application Status" 
        className="w-[35px] h-[35px] mb-8"
      />
      <h2 className={`text-2xl font-semibold mb-4 ${status === 'REJECTED' ? 'text-[#FF4D4F]' : ''}`}>
        {status === 'PENDING' ? 'Application Under Review' : 'Application Incomplete'}
      </h2>
      <p className="text-[#8C8C8C] max-w-md text-base">
        {status === 'PENDING' ? (
          'Your application is currently under review. Our team is carefully evaluating your submission to ensure that all necessary information and documentation meet our requirements. We will notify you of the outcome as soon as the review process is complete. Thank you for your patience.'
        ) : (
          <>
            {rejectionReason}
          </>
        )}
      </p>
      {status === 'REJECTED' && (
        <Button 
          onClick={() => router.push('/company-profile')}
          className="mt-8 bg-[#0B75FF] hover:bg-[#0052CC] text-white px-8"
        >
          Apply Again
        </Button>
      )}
    </div>
  )
} 