"use client"

import { useParams } from "next/navigation"
import { useSingleCompanyProfile } from "@/lib/hooks/useFetchCompanyProfiles"
import { useCompanyVerification } from "@/lib/hooks/useCompanyVerification"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { RejectionDialog } from "@/components/ui/rejection-dialog"
import { Loader2 } from "lucide-react"

export default function CompanyProfilePage() {
  const { id } = useParams()
  const { data, isLoading } = useSingleCompanyProfile(id as string)
  const { accept, reject, isAccepting, isRejecting } = useCompanyVerification()
  const company = data?.companyProfile

  const breadcrumbItems = [
    { label: "Users", href: "/users" },
    { label: "Company", href: "/users" },
    { label: "View Company", href: `/users/${id}` },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-[calc(100%-85px)] pl-[85px] mx-auto">
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb items={breadcrumbItems} />
          {company?.verificationStatus === "PENDING" && (
            <div className="flex gap-3">
              <Button 
                variant="default" 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => accept(id as string)}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept'
                )}
              </Button>
              <RejectionDialog 
                onReject={(reason) => reject({ id: id as string, reason })}
                isRejecting={isRejecting}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-6">Company Profile</h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter a brief description here to give readers an overview of the content form below.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-24 gap-y-6">
              <Field label="Company Name:" value={company?.name} />
              <Field label="Website Link:" value={company?.websiteUrl} />
              <Field label="Company Address:" value={company?.address} />
              <Field label="Business Type" value={company?.businessType.name} />
              <Field label="Industry Type" value={company?.industryType.name} />
              <Field label="Contact Phone:" value={company?.phone} />
              <Field 
                label="Country of Incorporation:" 
                value={company?.countryOfIncorporation} 
              />
              <Field 
                label="Number of Employee:" 
                value={company?.numberOfEmployees} 
              />
              <Field 
                label="Tax Identification Number:" 
                value={company?.taxIdentificationNumber} 
              />
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium mb-2">Other Description</h3>
              <p className="text-gray-600">
                {company?.otherDescription || "No description provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-1">{label}</h3>
      <p className="text-gray-600">{value || "N/A"}</p>
    </div>
  )
} 