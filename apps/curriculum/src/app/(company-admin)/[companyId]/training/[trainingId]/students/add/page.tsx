"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateStudentData, useAddStudent } from "@/lib/hooks/useStudents"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { FormHeader } from "./components/FormHeader"
import { FormStepper } from "./components/FormStepper"
import { PersonalInfoForm } from "./components/PersonalInfoForm"
import { ContactInfoForm } from "./components/ContactInfoForm"
import { EducationForm } from "./components/EducationForm"
import { EmergencyContactForm } from "./components/EmergencyContactForm"
import { AdditionalInfoForm } from "./components/AdditionalInfoForm"
import { 
  personalInfoSchema, 
  contactInfoSchema,
  educationSchema,
  emergencyContactSchema,
  studentFormSchema, 
  StudentFormValues 
} from "./components/formSchemas"

export default function AddStudentPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string
  const trainingId = params.trainingId as string
  const [step, setStep] = useState(1)
  
  const { 
    cities, 
    languages, 
    academicLevels,
    disabilities,
    marginalizedGroups,
    addStudent,
    isLoading 
  } = useAddStudent()

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      hasSmartphone: false,
      smartphoneOwner: "",
      email: "",
      contactPhone: "",
      cityId: "",
      subCity: "",
      woreda: "",
      houseNumber: "",
      academicLevelId: "",
      fieldOfStudy: "",
      hasTrainingExperience: false,
      trainingExperienceDescription: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      disabilityIds: [],
      marginalizedGroupIds: [],
      hasDisability: null,
      belongsToMarginalizedGroup: null,
    },
    mode: "onChange"
  })
  
  const handleCancel = () => {
    router.back()
  }

  const validateStep = async () => {
    let isValid = false;
    
    // Validate only fields relevant to the current step
    switch (step) {
      case 1:{
        const fieldsToValidate: (keyof StudentFormValues)[] = [
          "firstName", 
          "lastName", 
          "dateOfBirth", 
          "gender", 
          "languageId",
          "hasSmartphone",
        ];
        
        // Only validate smartphoneOwner if hasSmartphone is true
        if (form.getValues("hasSmartphone")) {
          fieldsToValidate.push("smartphoneOwner");
        }
        
        isValid = await form.trigger(fieldsToValidate);
        break;
        }
      case 2:
        isValid = await form.trigger([
          "email", 
          "contactPhone", 
          "cityId", 
          "subCity", 
          "woreda",
          "houseNumber"
        ]);
        console.log("Step 2 Form Errors:", form.formState.errors);
        break;
      case 3:
        // Validate education fields
        isValid = await form.trigger([
          "academicLevelId",
          "fieldOfStudy",
          "hasTrainingExperience",
          // Conditionally validate description
          ...(form.getValues("hasTrainingExperience") ? ["trainingExperienceDescription" as const] : [])
        ]);
        console.log("Step 3 Validation Result:", isValid); // Keep log for step 3
        console.log("Step 3 Form Errors:", form.formState.errors); // Keep log for step 3
        break;
      case 4:
        // Validate emergency contact fields
        isValid = await form.trigger([
          "emergencyContactName",
          "emergencyContactPhone",
          "emergencyContactRelationship",
        ]);
        console.log("Step 4 Validation Result:", isValid);
        console.log("Step 4 Form Errors:", form.formState.errors);
        break;
      case 5:
        // Validate step 5 fields including the boolean selectors
        const fieldsToValidateStep5: (keyof StudentFormValues)[] = [
          "hasDisability", 
          "belongsToMarginalizedGroup"
        ];
        // If hasDisability is true, also validate disabilityIds
        if (form.getValues("hasDisability") === true) {
           fieldsToValidateStep5.push("disabilityIds");
        }
        // If belongsToMarginalizedGroup is true, also validate marginalizedGroupIds
         if (form.getValues("belongsToMarginalizedGroup") === true) {
           fieldsToValidateStep5.push("marginalizedGroupIds");
        }

        isValid = await form.trigger(fieldsToValidateStep5);
        console.log("Step 5 Validation Result:", isValid);
        console.log("Step 5 Form Errors:", form.formState.errors);
        break;
    }
    
    console.log(`validateStep completed for step ${step}. Is valid: ${isValid}`);
    return isValid;
  }

  const handleContinue = async () => {
    const isValid = await validateStep();
    
    if (isValid) {
      setStep(step + 1);
    }
  }

  const onSubmit = async (values: StudentFormValues) => {
    console.log("Final Submit form", values)
    
    // Format date to YYYY-MM-DD string
    const formattedDateOfBirth = values.dateOfBirth instanceof Date
      ? values.dateOfBirth.toISOString().split('T')[0]
      : ""; 
    
    // Construct the data payload according to CreateStudentData interface
    const studentData: CreateStudentData = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      contactPhone: values.contactPhone,
      dateOfBirth: formattedDateOfBirth,
      gender: values.gender,
      cityId: values.cityId,
      subCity: values.subCity,
      woreda: values.woreda,
      houseNumber: values.houseNumber,
      languageId: values.languageId,
      academicLevelId: values.academicLevelId,
      fieldOfStudy: values.fieldOfStudy,
      hasSmartphone: values.hasSmartphone,
      hasTrainingExperience: values.hasTrainingExperience,
      trainingExperienceDescription: values.trainingExperienceDescription || undefined,
      emergencyContactName: values.emergencyContactName,
      emergencyContactPhone: values.emergencyContactPhone,
      emergencyContactRelationship: values.emergencyContactRelationship,
      // Only include IDs if the corresponding boolean is true
      disabilityIds: values.hasDisability ? (values.disabilityIds || []) : [],
      marginalizedGroupIds: values.belongsToMarginalizedGroup ? (values.marginalizedGroupIds || []) : [],
    }

    try {
      await addStudent({ trainingId, studentData });
      // Redirect back to the previous page. The hook handles toast and query invalidation.
      router.back(); 
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Personal Information"
      case 2:
        return "Contact Information"
      case 3:
        return "Education & Experience"
      case 4:
        return "Emergency Contact"
      case 5:
        return "Additional Information"
      default:
        return ""
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full my-10">
        <div className="sticky top-0 bg-white z-10 pt-6 px-6 md:pt-8 md:px-8 rounded-t-lg">
          <FormHeader onCancel={handleCancel} />
          
          <div className="flex justify-center mb-6">
            <FormStepper currentStep={step} totalSteps={5} />
          </div>
          
          <h1 className="text-xl font-bold text-gray-800 mb-6">
            {getStepTitle()}
          </h1>
        </div>

        <div className="p-6 md:px-8 pt-0">
          <div className="max-w-3xl">
            <Form {...form}>
              <form className="space-y-8">
                {step === 1 && <PersonalInfoForm form={form} languages={languages} />}
                {step === 2 && <ContactInfoForm form={form} cities={cities} />}
                {step === 3 && <EducationForm form={form} academicLevels={academicLevels} />}
                {step === 4 && <EmergencyContactForm form={form} />}
                {step === 5 && <AdditionalInfoForm form={form} disabilities={disabilities} marginalizedGroups={marginalizedGroups} />}
                
                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setStep(step - 1)}
                    >
                      Back
                    </Button>
                  )}
                  <div className={step > 1 ? "ml-auto" : "w-full flex justify-end"}>
                    {step < 5 ? (
                      <Button 
                        type="button"
                        onClick={handleContinue}
                        className="bg-brand hover:bg-blue-600 text-white px-8"
                      >
                        {step === 4 ? "Next" : "Continue"}
                      </Button>
                    ) : (
                      <Button 
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        className="bg-brand hover:bg-blue-600 text-white px-8"
                        disabled={isLoading || !form.formState.isValid}
                      >
                        {isLoading ? "Submitting..." : "Submit"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
} 