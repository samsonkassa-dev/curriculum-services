/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { useCreateObjective, useUpdateObjective } from "@/lib/hooks/useObjective"
import { toast } from "sonner"
import { useCreateOutcome } from "@/lib/hooks/useOutcome"

export interface ObjectiveFormData {
  generalObjective: string
  specificObjective: string
  outcome: string
}

interface ObjectiveProps {
  trainingId: string
  initialData?: {
    generalObjective?: { definition: string, id: string }
    specificObjectives?: Array<{
      id: string
      definition: string
      outcomes: Array<{
        id: string
        definition: string
      }>
    }>
  } | null
  onSave: (data: ObjectiveFormData) => Promise<void>
  onCancel: () => void
}

interface SpecificObjective {
  id: string
  definition: string
  outcomes: Array<{
    id: string
    definition: string
  }>
  showNewOutcome?: boolean
}

interface Outcome {
  id: string;
  definition: string;
}

interface ExistingObjective {
  isExisting: true;
  id: string;
  definition: string;
  outcomes: Array<{ id: string; definition: string; }>;
}

interface NewObjective {
  isExisting: false;
  definition: string;
  outcomes: string[];
}

type CombinedObjective = ExistingObjective | NewObjective;

export function Objective({ trainingId, initialData, onSave, onCancel }: ObjectiveProps) {
  const [generalObjective, setGeneralObjective] = useState(initialData?.generalObjective?.definition || "")
  const [specificObjectives, setSpecificObjectives] = useState<SpecificObjective[]>(
    initialData?.specificObjectives || []
  )
  const [newSpecificObjectives, setNewSpecificObjectives] = useState<Array<{
    definition: string
    outcomes: string[]
  }>>([])
  const [newOutcomes, setNewOutcomes] = useState<{[specificId: string]: string[]}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const objectiveMutation = useCreateObjective()
  const objectiveUpdateMutation = useUpdateObjective()
  const outcomeMutation = useCreateOutcome()

  const handleAddSpecificObjective = () => {
    setNewSpecificObjectives(prev => [...prev, { 
      definition: "", 
      outcomes: []
    }])
  }

  const handleAddOutcomeToNew = (specificIndex: number) => {
    setNewSpecificObjectives(prev => prev.map((obj, i) => 
      i === specificIndex ? { 
        ...obj, 
        outcomes: [...obj.outcomes, ""] 
      } : obj
    ))
  }

  const handleAddOutcome = (index: number) => {
    setNewSpecificObjectives(prev => prev.map((obj, i) => 
      i === index ? { ...obj, showOutcome: true } : obj
    ))
  }

  const handleRemoveSpecificObjective = (index: number) => {
    setNewSpecificObjectives(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddOutcomeToExisting = (specificId: string) => {
    setNewOutcomes(prev => ({
      ...prev,
      [specificId]: [...(prev[specificId] || []), ""]
    }))
  }

  const handleUpdateNewOutcome = (specificId: string, index: number, value: string) => {
    setNewOutcomes(prev => ({
      ...prev,
      [specificId]: prev[specificId].map((outcome, i) => i === index ? value : outcome)
    }))
  }

  const handleRemoveNewOutcome = (specificId: string, index: number) => {
    setNewOutcomes(prev => ({
      ...prev,
      [specificId]: prev[specificId].filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)

      let generalObjectiveId = initialData?.generalObjective?.id

      // Handle General Objective - only create if it doesn't exist
      if (!generalObjectiveId && generalObjective) {
        const result = await objectiveMutation.mutateAsync({
          data: { definition: generalObjective, trainingId },
          isGeneral: true
        })
        generalObjectiveId = result.objective.id
      } else if (generalObjectiveId && generalObjective !== initialData?.generalObjective?.definition) {
        // Update existing general objective if changed
        await objectiveUpdateMutation.mutateAsync({
          objectiveId: generalObjectiveId,
          data: { definition: generalObjective, trainingId },
          isGeneral: true
        })
      }

      // Handle new specific objectives and their outcomes
      for (const newObj of newSpecificObjectives) {
        if (newObj.definition) {
          const result = await objectiveMutation.mutateAsync({
            data: { definition: newObj.definition, trainingId },
            isGeneral: false
          })

          // Create outcomes for this new specific objective
          for (const outcome of newObj.outcomes) {
            if (outcome.trim()) {
              await outcomeMutation.mutateAsync({
                definition: outcome,
                trainingId,
                objectiveId: result.objective.id
              })
            }
          }
        }
      }

      // Handle new outcomes for existing specific objectives
      for (const [specificId, outcomes] of Object.entries(newOutcomes)) {
        for (const outcome of outcomes) {
          if (outcome.trim()) {
            await outcomeMutation.mutateAsync({
              definition: outcome,
              trainingId,
              objectiveId: specificId
            })
          }
        }
      }

      toast.success("Saved successfully")
      
      // Only call onSave with empty data since everything is already saved
      onSave({ 
        generalObjective: "", 
        specificObjective: "",
        outcome: ""
      })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EditFormContainer
      title="Curriculum Objective"
      description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
    >
      <div className="space-y-6">
        {/* General Objective */}
        <div className="space-y-4">
          <label className="text-sm font-medium">General Objective</label>
          <Input
            value={generalObjective}
            onChange={(e) => setGeneralObjective(e.target.value)}
            placeholder="Enter general objective"
          />
        </div>

        {/* Specific Objectives Section */}
        <div className="space-y-4">
          {/* All Specific Objectives (Both Existing and New) */}
          {[
            ...(initialData?.specificObjectives || []).map((specific) => ({
              ...specific,
              isExisting: true as const,
            })),
            ...newSpecificObjectives.map((obj) => ({
              ...obj,
              isExisting: false as const,
            })),
          ].map((obj: CombinedObjective, index) => (
            <div
              key={obj.isExisting ? obj.id : `new-${index}`}
              className="space-y-2"
            >
              <div className="">
                {
                  <label className="text-sm font-medium mb-2 block">
                    Specific Objective
                  </label>
                }
                <div className="relative">
                  <Input
                    value={obj.isExisting ? obj.definition : obj.definition}
                    onChange={
                      obj.isExisting
                        ? undefined
                        : (e) => {
                            setNewSpecificObjectives((prev) =>
                              prev.map((item, i) =>
                                i ===
                                index -
                                  (initialData?.specificObjectives?.length || 0)
                                  ? { ...item, definition: e.target.value }
                                  : item
                              )
                            );
                          }
                    }
                    placeholder={
                      obj.isExisting ? undefined : "Enter specific objective"
                    }
                    readOnly={obj.isExisting}
                    className="pr-10"
                  />
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={
                      obj.isExisting
                        ? undefined
                        : () =>
                            handleRemoveSpecificObjective(
                              index -
                                (initialData?.specificObjectives?.length || 0)
                            )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
                  >
                    <img src="/delete.svg" alt="delete" className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Outcomes Section */}
              <div className="pl-8 space-y-2">
                {obj.isExisting ? (
                  <>
                    {/* Existing Outcomes */}
                    {obj.outcomes.map((outcome) => (
                      <div key={outcome.id} className="">
                        <label className="text-sm font-medium py-3 block">
                          Outcomes
                        </label>
                        <div key={outcome.id} className="relative">
                          <Input
                            value={outcome.definition}
                            readOnly
                            className=""
                          />
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
                          >
                            <img
                              src="/delete.svg"
                              alt="delete"
                              className="w-4 h-4"
                            />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {/* New outcomes for existing specific */}
                    {obj.isExisting &&
                      newOutcomes[obj.id]?.map((outcome, idx) => (
                        <div key={`new-${idx}`} className="relative">
                          <Input
                            value={outcome}
                            onChange={(e) =>
                              handleUpdateNewOutcome(
                                obj.id!,
                                idx,
                                e.target.value
                              )
                            }
                            placeholder="Enter outcome"
                            className="pr-10"
                          />
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNewOutcome(obj.id!, idx)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
                          >
                            <img
                              src="/delete.svg"
                              alt="delete"
                              className="w-4 h-4"
                            />
                          </Button>
                        </div>
                      ))}
                    <Button
                      onClick={() =>
                        obj.isExisting && handleAddOutcomeToExisting(obj.id)
                      }
                      variant="link"
                      className="text-brand"
                    >
                      + Add Outcome
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Outcomes for new specific objective */}
                    {obj.outcomes.map(
                      (outcome: string | Outcome, outcomeIndex) => {
                        const specificIndex =
                          index -
                          (initialData?.specificObjectives?.length || 0);
                        return (
                          <div key={outcomeIndex} className="">
                            <label className="text-sm font-medium py-3 block">
                              Outcome
                            </label>
                            <div className="relative">
                              <Input
                                value={
                                  typeof outcome === "string"
                                    ? outcome
                                    : outcome.definition
                                }
                                onChange={(e) => {
                                  setNewSpecificObjectives((prev) =>
                                    prev.map((item, i) =>
                                      i === specificIndex
                                        ? {
                                            ...item,
                                            outcomes: item.outcomes.map(
                                              (o, oi) =>
                                                oi === outcomeIndex
                                                  ? e.target.value
                                                  : o
                                            ),
                                          }
                                        : item
                                    )
                                  );
                                }}
                                placeholder="Enter outcome"
                                className="pr-10"
                              />
                              <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setNewSpecificObjectives((prev) =>
                                    prev.map((item, i) =>
                                      i === specificIndex
                                        ? {
                                            ...item,
                                            outcomes: item.outcomes.filter(
                                              (_, oi) => oi !== outcomeIndex
                                            ),
                                          }
                                        : item
                                    )
                                  );
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
                              >
                                <img
                                  src="/delete.svg"
                                  alt="delete"
                                  className="w-4 h-4"
                                />
                              </Button>
                            </div>
                          </div>
                        );
                      }
                    )}
                    <Button
                      onClick={() =>
                        handleAddOutcomeToNew(
                          index - (initialData?.specificObjectives?.length || 0)
                        )
                      }
                      variant="link"
                      className="text-brand"
                    >
                      + Add Outcome
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Add Specific Objective Button */}
          <Button
            onClick={handleAddSpecificObjective}
            variant="link"
            className="text-brand"
          >
            + Add Specific Objective
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-10 pt-8">
          <Button variant="outline" onClick={onCancel}>
            Back
          </Button>
          <Button
            onClick={handleSave}
            className="bg-brand text-white"
            disabled={!generalObjective || isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : initialData
              ? "Edit"
              : "Save and Continue"}
          </Button>
        </div>
      </div>
    </EditFormContainer>
  );
} 