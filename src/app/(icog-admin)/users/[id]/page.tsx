"use client"

import { useParams } from "next/navigation"
import { useSingleCompanyProfile } from "@/lib/hooks/useFetchCompanyProfiles"
import { useCompanyVerification } from "@/lib/hooks/useCompanyVerification"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { RejectionDialog } from "@/components/ui/rejection-dialog"
import { Loader2 } from "lucide-react"
import { FilePreview } from "@/components/file-upload/file-preview"

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
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 md:py-8 md:pl-12">
        <div className="flex flex-col md:flex-row gap-4 items-start md:justify-between py-4 pl-2 md:p-0 mb-3 md:mb-6">
          <Breadcrumb items={breadcrumbItems} />
          {company?.verificationStatus === "PENDING" && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-[#eefaeb] text-green-500 border-green-500 px-6"
                onClick={() => accept(id as string)}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  "Accept"
                )}
              </Button>
              <RejectionDialog
                onReject={(reason) => reject({ id: id as string, reason })}
                isRejecting={isRejecting}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg md:py-6 md:px-8">
          <h1 className="text-xl font-semibold mb-2">Company Profile</h1>
          <p className="text-gray-500 md:text-sm text-xs mb-5">
            Enter a brief description here to give readers an overview of the
            content form below.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6">
              <Field label="Company Name:" value={company?.name} />
              <Field label="Website Link:" value={company?.websiteUrl} />
              <Field label="Company Address:" value={company?.address} />
              <Field
                label="Business Type:"
                value={company?.businessType.name}
              />
              <Field
                label="Industry Type:"
                value={company?.industryType.name}
              />
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
              <Field
                label="Other Description:"
                value={company?.otherDescription || "No description provided"}
              />
              {company?.companyFiles?.length ? (
                <div>
                  <h2 className="text-lg font-semibold ">Company Documents</h2>
                  <p className="text-[#787878] text-sm mb-1">please Write a description about this section</p>
                  <div className="space-y-4">
                    {company.companyFiles.map((file, index) => (
                      <FilePreview
                        key={index}
                        fileUrl={file.fileUrl}
                        fileName={file.companyFileType.name}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-row items-center gap-4 w-full">
      <h3 className="md:text-lg text-[13px] font-medium">{label}</h3>
      <div className="text-[#787878]">
        {value || "N/A"}
      </div>
    </div>
  )
} 