// "use client"

// import { useState, useEffect, useMemo, useCallback } from "react"
// import { useRouter, useParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card } from "@/components/ui/card"
// import { Plus, Trash2, PencilIcon, AlertCircle } from "lucide-react"
// import { 
//   useCreateSessionAssessment, 
//   useSessionAssessments,
//   useUpdateAssessmentQuestion,
//   useDeleteAssessmentEntry,
//   useDeletePreTrainingAssessment,
//   useAddQuestionToAssessment,
//   AssessmentQuestion,
//   AssessmentEntry 
// } from "@/lib/hooks/useSessionAssesment"
// import { toast } from "sonner"

// interface PreTrainingAssessmentProps {
//   sessionId: string;
// }

// // Extracted component for choice input
// const ChoiceInput = ({
//   choice,
//   index,
//   onChange,
//   onRemove,
//   canRemove
// }: {
//   choice: string;
//   index: number;
//   onChange: (value: string) => void;
//   onRemove: () => void;
//   canRemove: boolean;
// }) => (
//   <div className="flex items-center gap-2">
//     <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
//       {String.fromCharCode(65 + index)}
//     </div>
//     <Input
//       value={choice}
//       onChange={(e) => onChange(e.target.value)}
//       placeholder={`Choice ${index + 1}`}
//       className="flex-1"
//     />
//     <Button
//       variant="ghost"
//       size="sm"
//       onClick={onRemove}
//       disabled={!canRemove}
//       className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
//     >
//       <Trash2 className="h-4 w-4" />
//     </Button>
//   </div>
// );

// // Extracted component for preview choice
// const PreviewChoice = ({ choice, index }: { choice: string; index: number }) => (
//   <div className="flex items-center gap-2">
//     <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
//       {String.fromCharCode(65 + index)}
//     </div>
//     <span>{choice || `Choice ${index + 1} will appear here`}</span>
//   </div>
// );

// // Extracted component for existing question display
// const ExistingQuestionCard = ({
//   entry,
//   index,
//   onEdit,
//   onDelete
// }: {
//   entry: AssessmentEntry;
//   index: number;
//   onEdit: () => void;
//   onDelete: () => void;
// }) => (
//   <Card key={entry.id} className="bg-gray-50 border p-6">
//     <div className="flex justify-between items-start">
//       <div className="flex-1">
//         <h3 className="text-lg font-medium mb-4">
//           <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full mr-2 text-sm">
//             {index + 1}
//           </span>
//           {entry.question}
//         </h3>
//         <div className="space-y-3 pl-9">
//           {entry.choices.map((choice: string, choiceIdx: number) => (
//             <div key={choiceIdx} className="flex items-center gap-2">
//               <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
//                 {String.fromCharCode(65 + choiceIdx)}
//               </div>
//               <span>{choice}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="flex gap-2">
//         <Button 
//           variant="ghost" 
//           size="sm" 
//           onClick={onEdit}
//           className="h-8 w-8 p-0"
//         >
//           <PencilIcon className="h-4 w-4" />
//         </Button>
//         <Button 
//           variant="ghost" 
//           size="sm" 
//           onClick={onDelete}
//           className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
//         >
//           <Trash2 className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   </Card>
// );

// /**
//  * Pre-training Assessment component that allows creating multiple-choice questions
//  * for trainees to answer before the training session.
//  */
// export default function PreTrainingAssessment({ sessionId }: PreTrainingAssessmentProps) {
//   const router = useRouter()
//   const params = useParams()
//   const [isEditing, setIsEditing] = useState<string | null>(null)
//   const [questions, setQuestions] = useState<AssessmentQuestion[]>([
//     { question: "", choices: ["", ""] }
//   ])
//   const [multipleQuestions, setMultipleQuestions] = useState(false)
  
//   // Fetch existing assessment for this session
//   const { 
//     data: assessmentData, 
//     isLoading: isLoadingAssessment,
//     error: assessmentError
//   } = useSessionAssessments(sessionId)
  
//   const { createSessionAssessment, isLoading: isCreatingAssessment } = useCreateSessionAssessment(sessionId)
//   const { updateQuestion, isLoading: isUpdatingQuestion } = useUpdateAssessmentQuestion()
//   const { deleteAssessmentEntry, isLoading: isDeletingEntry } = useDeleteAssessmentEntry()
//   const { deletePreTrainingAssessment, isLoading: isDeletingAssessment } = useDeletePreTrainingAssessment()
//   const { addQuestion: addQuestionToAssessment, isLoading: isAddingQuestion } = useAddQuestionToAssessment()

//   // Extract assessment data
//   const assessment = assessmentData?.preTrainingAssessment
//   const assessmentId = assessment?.id
//   const hasExistingAssessment = useMemo(() => {
//     return !!assessment && !!assessment.preTrainingAssessmentEntries?.length
//   }, [assessment])

//   // Initialize form with default questions if no assessment exists
//   useEffect(() => {
//     if (!isLoadingAssessment && !hasExistingAssessment && !assessmentError) {
//       setQuestions([{ question: "", choices: ["", ""] }])
//     }
//   }, [isLoadingAssessment, hasExistingAssessment, assessmentError])

//   const addQuestion = useCallback(() => {
//     setQuestions(prev => [...prev, { question: "", choices: ["", ""] }])
//     if (isEditing) {
//       setMultipleQuestions(true)
//     }
//   }, [isEditing])

//   const removeQuestion = useCallback((index: number) => {
//     setQuestions(prev => prev.filter((_, i) => i !== index))
//     if (isEditing && questions.length <= 2) {
//       setMultipleQuestions(false)
//     }
//   }, [isEditing, questions.length])

//   const updateQuestionText = useCallback((index: number, question: string) => {
//     setQuestions(prev => prev.map((q, i) => 
//       i === index ? { ...q, question } : q
//     ))
//   }, [])

//   const addChoice = useCallback((questionIndex: number) => {
//     setQuestions(prev => prev.map((q, i) => 
//       i === questionIndex 
//         ? { ...q, choices: [...q.choices, ""] }
//         : q
//     ))
//   }, [])

//   const removeChoice = useCallback((questionIndex: number, choiceIndex: number) => {
//     setQuestions(prev => prev.map((q, i) => 
//       i === questionIndex 
//         ? { ...q, choices: q.choices.filter((_, cI) => cI !== choiceIndex) }
//         : q
//     ))
//   }, [])

//   const updateChoice = useCallback((questionIndex: number, choiceIndex: number, newChoice: string) => {
//     setQuestions(prev => prev.map((q, i) => 
//       i === questionIndex 
//         ? { 
//             ...q, 
//             choices: q.choices.map((c, cI) => 
//               cI === choiceIndex ? newChoice : c
//             ) 
//           }
//         : q
//     ))
//   }, [])

//   const validateQuestions = useCallback((questionsToValidate: AssessmentQuestion[]) => {
//     return questionsToValidate.every(q => 
//       q.question.trim() !== "" && 
//       q.choices.length >= 2 &&
//       q.choices.every(c => c.trim() !== "")
//     )
//   }, [])

//   const handleCreateSubmit = useCallback(() => {
//     // Validate form before submission
//     if (!validateQuestions(questions)) {
//       toast.error("Please complete all questions with at least 2 choices each")
//       return
//     }

//     // Submit the assessment - toast messages are handled by the hook
//     createSessionAssessment({ assessmentQuestions: questions })
//   }, [questions, createSessionAssessment, validateQuestions])

//   const handleUpdateQuestion = useCallback((entryId: string) => {
//     // Find the question being edited
//     const questionToUpdate = questions[0]

//     // Validate initial question
//     if (!questionToUpdate.question.trim() || questionToUpdate.choices.some(c => !c.trim())) {
//       toast.error("Please complete the question and all choices")
//       return
//     }

//     // If multiple questions, validate all additional questions
//     if (multipleQuestions && questions.length > 1) {
//       const additionalQuestions = questions.slice(1)
//       if (!validateQuestions(additionalQuestions)) {
//         toast.error("Please complete all additional questions with valid choices")
//         return
//       }
//     }

//     // Update the first question
//     updateQuestion({
//       preTrainingAssessmentEntryId: entryId,
//       questionData: {
//         question: questionToUpdate.question,
//         choices: questionToUpdate.choices
//       }
//     }, {
//       onSuccess: () => {
//         // If there are additional questions, add them to existing assessment
//         if (multipleQuestions && questions.length > 1 && assessmentId) {
//           // Process each additional question sequentially
//           const processQuestions = async () => {
//             const additionalQuestions = questions.slice(1);
//             let allSuccess = true;
            
//             for (const q of additionalQuestions) {
//               try {
//                 await new Promise((resolve, reject) => {
//                   addQuestionToAssessment(
//                     {
//                       assessmentId: assessmentId,
//                       questionData: {
//                         question: q.question,
//                         choices: q.choices
//                       }
//                     },
//                     {
//                       onSuccess: resolve,
//                       onError: reject
//                     }
//                   );
//                 });
//               } catch (err) {
//                 allSuccess = false;
//                 break;
//               }
//             }
            
//             return allSuccess;
//           };
          
//           // Execute the sequential processing
//           processQuestions().then(() => {
//             setIsEditing(null);
//             setMultipleQuestions(false);
//           });
//         } else {
//           setIsEditing(null);
//           setMultipleQuestions(false);
//         }
//       }
//     });
//   }, [questions, updateQuestion, validateQuestions, multipleQuestions, addQuestionToAssessment, assessmentId]);

//   const startEditQuestion = useCallback((entry: AssessmentEntry) => {
//     setIsEditing(entry.id)
//     setMultipleQuestions(false)
//     setQuestions([{
//       question: entry.question,
//       choices: [...entry.choices]
//     }])
//   }, [])

//   const cancelEdit = useCallback(() => {
//     setIsEditing(null)
//     setMultipleQuestions(false)
//     setQuestions([{ question: "", choices: ["", ""] }])
//   }, [])

//   const handleDeleteQuestion = useCallback((entryId: string) => {
//     if (confirm("Are you sure you want to delete this question?")) {
//       deleteAssessmentEntry(entryId, {
//         onSuccess: () => {
//           toast.success("Question deleted successfully")
//         }
//       })
//     }
//   }, [deleteAssessmentEntry])

//   const handleDeleteAssessment = useCallback(() => {
//     if (!assessmentId) return
    
//     if (confirm("Are you sure you want to delete the entire assessment?")) {
//       deletePreTrainingAssessment(assessmentId, {
//         onSuccess: () => {
//           router.push(`/${params.companyId}/training/${params.trainingId}/sessions/${params.sessionId}`)
//         }
//       })
//     }
//   }, [deletePreTrainingAssessment, assessmentId, router, params])

//   if (isLoadingAssessment) {
//     return <div className="flex items-center justify-center py-12">Loading assessment...</div>
//   }

//   return (
//     <div className="container py-8 max-w-6xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl font-bold">Pre-Training Assessment</h2>
//           <p className="text-gray-600 mt-1">
//             Multiple-choice questions for trainers to answer before the training session
//           </p>
//         </div>
        
//         <div className="flex gap-2">
//           {hasExistingAssessment && (
//             <Button
//               variant="destructive"
//               className="flex items-center gap-1"
//               onClick={handleDeleteAssessment}
//               disabled={isDeletingAssessment}
//             >
//               <Trash2 className="h-4 w-4" />
//               {isDeletingAssessment ? "Deleting..." : "Delete Assessment"}
//             </Button>
//           )}
          
//           <Button
//             variant="outline"
//             onClick={() => router.push(`/${params.companyId}/training/${params.trainingId}/sessions/${params.sessionId}`)}
//           >
//             Back to Session
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Left Column: Form or Assessment Questions */}
//         <div className="space-y-6">
//           {/* Form for creating or editing */}
//           {!hasExistingAssessment || isEditing ? (
//             <Card className="p-6">
//               <div className="mb-4">
//                 <h3 className="text-xl font-semibold">
//                   {isEditing ? "Edit Question" : "Create Assessment"}
//                 </h3>
//                 {isEditing && multipleQuestions && (
//                   <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
//                     <AlertCircle className="h-4 w-4" />
//                     First question will update the existing one, additional questions will be added as new
//                   </p>
//                 )}
//               </div>
//               <div className="space-y-6">
//                 {questions.map((q, questionIndex) => (
//                   <div key={questionIndex} className="space-y-4">
//                     <div className="mb-4">
//                       <div className="flex justify-between">
//                         <label className="block text-sm font-medium mb-1">
//                           {isEditing && multipleQuestions 
//                             ? `Question ${questionIndex + 1}${questionIndex === 0 ? " (Editing)" : " (New)"}` 
//                             : "Question"}
//                         </label>
//                         {isEditing && questionIndex > 0 && (
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => removeQuestion(questionIndex)}
//                             className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         )}
//                       </div>
//                       <Input
//                         value={q.question}
//                         onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
//                         placeholder="Enter your question"
//                         className="w-full"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2">Answer Choices</label>
//                       <div className="space-y-3">
//                         {q.choices.map((choice, choiceIndex) => (
//                           <ChoiceInput
//                             key={choiceIndex}
//                             choice={choice}
//                             index={choiceIndex}
//                             onChange={(value) => updateChoice(questionIndex, choiceIndex, value)}
//                             onRemove={() => removeChoice(questionIndex, choiceIndex)}
//                             canRemove={q.choices.length > 2}
//                           />
//                         ))}
//                         {q.choices.length < 6 && (
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => addChoice(questionIndex)}
//                             className="flex items-center gap-1"
//                           >
//                             <Plus className="h-3.5 w-3.5" />
//                             Add Choice
//                           </Button>
//                         )}
//                       </div>
//                     </div>

//                     {!isEditing && (
//                       <div className="flex justify-end">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => removeQuestion(questionIndex)}
//                           className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
//                           disabled={questions.length <= 1}
//                         >
//                           <Trash2 className="h-4 w-4 mr-1" />
//                           Remove Question
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 ))}

//                 {/* Button to add questions - show in both create and edit modes */}
//                 <Button 
//                   onClick={addQuestion} 
//                   variant="outline" 
//                   className="flex items-center gap-2 w-full"
//                 >
//                   <Plus className="h-4 w-4" />
//                   Add Another Question
//                 </Button>

//                 <div className="flex justify-end gap-2 pt-4">
//                   {isEditing ? (
//                     <>
//                       <Button 
//                         variant="outline" 
//                         onClick={cancelEdit}
//                       >
//                         Cancel
//                       </Button>
//                       <Button 
//                         onClick={() => handleUpdateQuestion(isEditing)}
//                         className="bg-blue-600 text-white hover:bg-blue-700"
//                         disabled={isUpdatingQuestion || isAddingQuestion}
//                       >
//                         {isUpdatingQuestion || isAddingQuestion ? "Saving..." : "Save Changes"}
//                       </Button>
//                     </>
//                   ) : (
//                     <>
//                       <Button 
//                         variant="outline" 
//                         onClick={() => router.push(`/${params.companyId}/training/${params.trainingId}/sessions/${params.sessionId}`)}
//                       >
//                         Cancel
//                       </Button>
//                       <Button 
//                         onClick={handleCreateSubmit} 
//                         className="bg-blue-600 text-white hover:bg-blue-700"
//                         disabled={isCreatingAssessment}
//                       >
//                         {isCreatingAssessment ? "Creating..." : "Save Assessment"}
//                       </Button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </Card>
//           ) : (
//             // Display the list of existing questions when not editing 
//             <Card className="p-6">
//               <div className="mb-4">
//                 <h3 className="text-xl font-semibold">Assessment Questions</h3>
//               </div>
//               <div className="space-y-6">
//                 {assessment?.preTrainingAssessmentEntries?.map((entry: AssessmentEntry, index: number) => (
//                   <ExistingQuestionCard
//                     key={entry.id}
//                     entry={entry}
//                     index={index}
//                     onEdit={() => startEditQuestion(entry)}
//                     onDelete={() => handleDeleteQuestion(entry.id)}
//                   />
//                 ))}
//               </div>
//             </Card>
//           )}
//         </div>

//         {/* Right Column: Preview or Details */}
//         <div>
//           <Card className="p-6">
//             <div className="mb-4">
//               <h3 className="text-xl font-semibold">
//                 {hasExistingAssessment && !isEditing ? "Assessment Preview" : "Preview"}
//               </h3>
//             </div>
//             <div className="space-y-6">
//               {/* When editing or creating, show the form preview */}
//               {(!hasExistingAssessment || isEditing) ? (
//                 <>
//                   {questions.map((q, questionIndex) => (
//                     <Card key={questionIndex} className="bg-gray-50 border p-6">
//                       <h3 className="text-lg font-medium mb-4">
//                         <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full mr-2 text-sm">
//                           {questionIndex + 1}
//                         </span>
//                         {q.question || "Your question will appear here"}
//                       </h3>
//                       <div className="space-y-3 pl-9">
//                         {q.choices.map((choice, choiceIdx) => (
//                           <PreviewChoice 
//                             key={choiceIdx} 
//                             choice={choice} 
//                             index={choiceIdx} 
//                           />
//                         ))}
//                       </div>
//                     </Card>
//                   ))}

//                   {questions.length === 0 && (
//                     <div className="text-center py-8 text-gray-500">
//                       Add questions to see them previewed here
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 // When viewing existing assessment, show additional information
//                 <div className="space-y-6">
//                   <div className="bg-gray-50 p-4 rounded-lg border">
//                     <h4 className="font-medium mb-2">Assessment Information</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Total Questions:</span>
//                         <span className="font-medium">{assessment?.preTrainingAssessmentEntries?.length}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Status:</span>
//                         <span className="font-medium text-green-600">Active</span>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//                     <h4 className="font-medium mb-2 text-blue-800">Assessment Instructions</h4>
//                     <p className="text-sm text-blue-700">
//                       This assessment will be shown to trainees before the session starts. 
//                       You can edit individual questions using the edit button.
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// } 