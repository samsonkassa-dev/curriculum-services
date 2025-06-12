"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useBaseData } from "@/lib/hooks/useBaseData";
import { Loading } from "@/components/ui/loading";
import {
  AssessmentFormProvider,
  useAssessmentForm,
} from "@/contexts/AssessmentFormContext";
import { useUserRole } from "@/lib/hooks/useUserRole";

interface AssessmentMethodViewProps {
  moduleId: string;
  onEdit: () => void;
}

interface AssessmentMethod {
  id: string;
  name: string;
  description: string;
}

function AssessmentMethodViewContent({ onEdit }: AssessmentMethodViewProps) {
  const { canEdit } = useUserRole();

  const { formData, hasAssessmentMethods, isFormDataFilled } = useAssessmentForm();

  // Fetch assessment method types for each category
  const { data: formativeMethods, isLoading: isLoadingFormative } = useBaseData(
    "assessment-type",
    { subType: "FORMATIVE" }
  );
  const { data: summativeMethods, isLoading: isLoadingSummative } = useBaseData(
    "assessment-type",
    { subType: "SUMMATIVE" }
  );
  const { data: otherMethods, isLoading: isLoadingOther } = useBaseData(
    "assessment-type",
    { subType: "OTHER" }
  );

  if (isLoadingFormative || isLoadingSummative || isLoadingOther) {
    return <Loading />;
  }

  // Helper function to get assessment method names from IDs
  const getMethodNames = (
    methodType: keyof typeof formData,
    methods: AssessmentMethod[] | undefined
  ) => {
    if (!methods) return [];

    const selectedMethods = Object.entries(formData[methodType] || {})
      .filter(([_, selected]) => selected === true)
      .map(([id]) => id);

    return methods
      .filter((method) => selectedMethods.includes(method.id))
      .map((method) => method.name);
  };

  // Get selected generic formative assessment methods
  const selectedFormativeMethods = getMethodNames(
    "formative",
    formativeMethods
  );

  // Get selected technology formative assessment methods
  const selectedSummativeMethods = getMethodNames(
    "summative",
    summativeMethods
  );

  // Get selected alternative formative assessment methods
  const selectedOtherMethods = getMethodNames("other", otherMethods);

  // Check if any methods are selected for a section
  const hasGenericMethods = selectedFormativeMethods.length > 0;
  const hasTechMethods = selectedSummativeMethods.length > 0;
  const hasAlternativeMethods = selectedOtherMethods.length > 0;

  // Check if any assessment methods exist
  const hasAnyMethod =
    hasGenericMethods ||
    hasTechMethods ||
    hasAlternativeMethods ||
    hasAssessmentMethods;

  // If no methods are available and user can't edit, show message
  if (!hasAnyMethod && !canEdit) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No assessment methods available yet.</p>
      </div>
    );
  }

  // Get default open section
  const getDefaultOpenSection = () => {
    if (isFormDataFilled.formative) return "formativeAssessments";
    if (isFormDataFilled.summative) return "summativeAssessments";
    if (isFormDataFilled.other) return "otherAssessments";
    return "formativeAssessments";
  };

  // Render list of assessment methods
  const renderMethodList = (methods: string[]) => {
    if (methods.length === 0)
      return <p className="text-gray-500 italic">None selected</p>;

    return (
      <ul className="list-disc pl-5">
        {methods.map((method, index) => (
          <li key={index} className="mb-1 text-gray-600 text-sm md:text-lg">
            {method}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="px-[7%] py-10 mb-10">
      <h1 className="text-md md:text-xl text-black mb-4 font-semibold">
        Assessment Methods
      </h1>

      <h2 className="text-md md:text-lg text-gray-500 font-normal mb-4">
        Methods used to evaluate learning progress and outcomes.
      </h2>

      <div className="space-y-4">
        <Accordion
          type="multiple"
          defaultValue={[getDefaultOpenSection()]}
          className="space-y-4"
        >
          {/*Formative Assessments Section */}
          <AccordionItem
            value="formativeAssessments"
            className="border-[0.5px] border-[#CED4DA] rounded-md"
          >
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">
                  Formative Assessments
                </span>
              </div>
              <div className="text-gray-400 flex gap-2">
                {canEdit && (
                  <img
                    src="/edit.svg"
                    alt=""
                    className="w-5 h-5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                {renderMethodList(selectedFormativeMethods)}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/*Summative Assessment Section */}
          <AccordionItem
            value="summativeAssessments"
            className="border-[0.5px] border-[#CED4DA] rounded-md"
          >
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">
                  Summative Assessments
                </span>
              </div>
              <div className="text-gray-400 flex gap-2">
                {canEdit && (
                  <img
                    src="/edit.svg"
                    alt=""
                    className="w-5 h-5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                {renderMethodList(selectedSummativeMethods)}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Other Assessments Section */}
          <AccordionItem
            value="otherAssessments"
            className="border-[0.5px] border-[#CED4DA] rounded-md"
          >
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">
                  Other Assessments
                </span>
              </div>
              <div className="text-gray-400 flex gap-2">
                {canEdit && (
                  <img
                    src="/edit.svg"
                    alt=""
                    className="w-5 h-5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                {renderMethodList(selectedOtherMethods)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export function AssessmentMethodView({
  moduleId,
  onEdit,
}: AssessmentMethodViewProps) {
  return (
    <AssessmentFormProvider moduleId={moduleId}>
      <AssessmentMethodViewContent moduleId={moduleId} onEdit={onEdit} />
    </AssessmentFormProvider>
  );
}
