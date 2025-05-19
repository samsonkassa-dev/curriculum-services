"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { useStudents, useAddStudent, useStudentById, useUpdateStudent, useDeleteStudent, Student, CreateStudentData } from "@/lib/hooks/useStudents"
import { Plus } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { studentColumns, createActionsColumn } from "./students/student-columns"
import { StudentDataTable } from "./students/student-data-table"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { studentFormSchema, StudentFormValues } from "../students/add/components/formSchemas"
import { ColumnDef } from "@tanstack/react-table"
import { StudentFormModal } from "./students/student-form-modal"
import { DeleteStudentDialog } from "./students/delete-student-dialog"

interface StudentsComponentProps {
  trainingId: string
}

export function StudentsComponent({ trainingId }: StudentsComponentProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  const { isProjectManager, isTrainingAdmin, isCompanyAdmin } = useUserRole()
  const { data, isLoading } = useStudents(trainingId, page, pageSize)
  const { 
    cities, 
    languages, 
    academicLevels,
    disabilities,
    marginalizedGroups,
    addStudent,
    isLoading: isSubmitting
  } = useAddStudent()
  const { data: studentData, isLoading: isLoadingStudent } = useStudentById(
    isEditing && currentStudentId ? currentStudentId : ''
  )
  const updateStudentMutation = useUpdateStudent()
  const deleteStudentMutation = useDeleteStudent()

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

  // Add a ref to track if we've loaded form data already
  const formDataLoadedRef = useRef(false);

  // Memoize student form data preparation
  const studentFormData = useMemo(() => {
    if (!isEditing || !studentData?.trainee || !currentStudentId) {
      return null;
    }
    
    const student = studentData.trainee;
    
    // Format date to Date object
    let dateOfBirth: Date | undefined = undefined;
    try {
      if (student.dateOfBirth) {
        dateOfBirth = new Date(student.dateOfBirth);
      }
    } catch (error) {
      console.log("Invalid date:", error);
    }
    
    // Check if student has disabilities
    const hasDisability = student.disabilities && student.disabilities.length > 0;
    const disabilityIds = hasDisability 
      ? student.disabilities.map(d => d.id) 
      : [];
    
    // Check if student belongs to marginalized groups
    const belongsToMarginalizedGroup = student.marginalizedGroups && student.marginalizedGroups.length > 0;
    const marginalizedGroupIds = belongsToMarginalizedGroup
      ? student.marginalizedGroups.map(g => g.id)
      : [];
    
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      contactPhone: student.contactPhone,
      dateOfBirth: dateOfBirth,
      gender: student.gender === "MALE" || student.gender === "FEMALE" 
        ? (student.gender as "MALE" | "FEMALE") 
        : undefined,
      cityId: student.city?.id || '',
      subCity: student.subCity,
      woreda: student.woreda,
      houseNumber: student.houseNumber,
      languageId: student.language?.id || '',
      academicLevelId: student.academicLevel?.id || '',
      fieldOfStudy: student.fieldOfStudy,
      hasSmartphone: student.hasSmartphone,
      hasTrainingExperience: student.hasTrainingExperience,
      trainingExperienceDescription: student.trainingExperienceDescription || '',
      emergencyContactName: student.emergencyContactName,
      emergencyContactPhone: student.emergencyContactPhone,
      emergencyContactRelationship: student.emergencyContactRelationship,
      hasDisability: hasDisability,
      disabilityIds: disabilityIds,
      belongsToMarginalizedGroup: belongsToMarginalizedGroup,
      marginalizedGroupIds: marginalizedGroupIds,
    }
  }, [studentData, isEditing, currentStudentId]);

  // Reset form data loaded ref when editing state changes
  useEffect(() => {
    if (!isEditing) {
      formDataLoadedRef.current = false;
    }
  }, [isEditing]);

  // Also update the form reset mechanism to be more reliable
  useEffect(() => {
    // Only reset form when studentFormData is available and we haven't loaded it yet
    if (studentFormData && showModal && isEditing && !formDataLoadedRef.current) {
      // Simple, single form reset with all values at once
      form.reset({
        ...studentFormData,
        // Ensure values are properly typed for select components
        cityId: studentFormData.cityId || '',
        languageId: studentFormData.languageId || '',
        academicLevelId: studentFormData.academicLevelId || '',
        disabilityIds: studentFormData.disabilityIds || [],
        marginalizedGroupIds: studentFormData.marginalizedGroupIds || [],
        gender: studentFormData.gender as "MALE" | "FEMALE" | undefined,
      });
      formDataLoadedRef.current = true;
    }
  }, [form, studentFormData, showModal, isEditing]);

  const handleAddStudent = useCallback(() => {
    formDataLoadedRef.current = false; // Reset tracking ref
    setShowModal(true);
    setIsEditing(false);
    setCurrentStudentId(null);
    setStep(1);
    form.reset({
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
    });
  }, [form]);
  
  const handleEditStudent = useCallback((student: Student) => {
    formDataLoadedRef.current = false; // Reset tracking ref
    
    // Set modal state
    setCurrentStudentId(student.id)
    setIsEditing(true)
    setShowModal(true)
    setStep(1)
  }, []);
  
  const handleDeleteStudent = useCallback((student: Student) => {
    setStudentToDelete(student)
    setDeleteDialogOpen(true)
  }, []);
  
  const confirmDelete = useCallback(async () => {
    if (studentToDelete) {
      try {
        // Only close dialog on successful API response
        await deleteStudentMutation.mutateAsync(studentToDelete.id);
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  }, [deleteStudentMutation, studentToDelete]);
  
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, []);

  const validateStep = useCallback(async () => {
    let isValid = false;
    
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
        break;
      case 3:
        isValid = await form.trigger([
          "academicLevelId",
          "fieldOfStudy",
          "hasTrainingExperience",
          ...(form.getValues("hasTrainingExperience") ? ["trainingExperienceDescription" as const] : [])
        ]);
        break;
      case 4:
        isValid = await form.trigger([
          "emergencyContactName",
          "emergencyContactPhone",
          "emergencyContactRelationship",
        ]);
        break;
      case 5:
        const fieldsToValidateStep5: (keyof StudentFormValues)[] = [
          "hasDisability", 
          "belongsToMarginalizedGroup"
        ];
        if (form.getValues("hasDisability") === true) {
           fieldsToValidateStep5.push("disabilityIds");
        }
        if (form.getValues("belongsToMarginalizedGroup") === true) {
           fieldsToValidateStep5.push("marginalizedGroupIds");
        }

        isValid = await form.trigger(fieldsToValidateStep5);
        break;
    }
    
    return isValid;
  }, [form, step]);

  const handleContinue = useCallback(async () => {
    const isValid = await validateStep();
    
    if (isValid) {
      setStep(prev => prev + 1);
    }
  }, [validateStep]);

  const onSubmit = useCallback(async (values: StudentFormValues) => {
    // Format date to YYYY-MM-DD string
    const formattedDateOfBirth = values.dateOfBirth instanceof Date
      ? values.dateOfBirth.toISOString().split('T')[0]
      : ""; 
    
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
      disabilityIds: values.hasDisability ? (values.disabilityIds || []) : [],
      marginalizedGroupIds: values.belongsToMarginalizedGroup ? (values.marginalizedGroupIds || []) : [],
    }

    try {
      if (isEditing && currentStudentId) {
        // Use mutateAsync to wait for the result
        await updateStudentMutation.mutateAsync({ id: currentStudentId, studentData });
        // Only close modal after successful API call
        setShowModal(false);
      } else {
        // Use the async version of addStudent
        await addStudent({ trainingId, studentData });
        // Only close modal after successful API call
        setShowModal(false);
      }
    } catch (error) {
      console.log("Submission failed:", error);
    }
  }, [addStudent, currentStudentId, isEditing, trainingId, updateStudentMutation]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }, []);

  // Memoize filtered and paginated students data
  const { 
    filteredStudents, 
    paginatedStudents,
    totalElements,
    totalPages 
  } = useMemo(() => {
    const filtered = data?.trainees?.filter(student => 
      student?.firstName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      student?.lastName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      student?.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) || [];

    const total = filtered.length || 0;
    const totalPgs = Math.ceil(total / pageSize);
    
    const paginated = filtered.slice(
      (page - 1) * pageSize,
      page * pageSize
    ) || [];

    return {
      filteredStudents: filtered,
      paginatedStudents: paginated,
      totalElements: total,
      totalPages: totalPgs
    };
  }, [data?.trainees, debouncedSearch, page, pageSize]);

  // Add the actions column to the existing columns
  const columnsWithActions = useMemo<ColumnDef<Student>[]>(() => {
    // Get the base columns
    const columns = [...studentColumns];
    
    // Add the actions column only if user has appropriate permissions
    const hasEditPermission = isCompanyAdmin || isProjectManager || isTrainingAdmin;
    
    if (hasEditPermission) {
      columns.push(createActionsColumn(handleEditStudent, handleDeleteStudent, hasEditPermission));
    }
    
    return columns;
  }, [handleEditStudent, handleDeleteStudent, isCompanyAdmin, isProjectManager, isTrainingAdmin]);

  // Check if user has permissions to edit
  const hasEditPermission = useMemo(() => {
    return isCompanyAdmin || isProjectManager || isTrainingAdmin;
  }, [isCompanyAdmin, isProjectManager, isTrainingAdmin]);

  const emptyState = useMemo(() => (
        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Student Added Yet</h3>
          <p className="text-gray-500 text-sm">
            This specifies the core teaching methods used to deliver content and facilitate learning.
          </p>
          {hasEditPermission && (
            <Button
              className="mt-4 bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
              onClick={handleAddStudent}
            >
              Add Student
            </Button>
          )}
        </div>
  ), [handleAddStudent, hasEditPermission]);

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        <h1 className="text-lg font-semibold mb-6">Students</h1>

        {!data?.trainees?.length ? (
          emptyState
        ) : (
          <>
            <div className="flex items-center lg:justify-end gap-3 mb-6">
              <div className="relative md:w-[300px]">
                <Image
                  src="/search.svg"
                  alt="Search"
                  width={19}
                  height={19}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5 z-10"
                />
                <Input
                  placeholder="Search students..."
                  className="pl-10 h-10 text-sm bg-white border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {hasEditPermission && (
                <Button
                  className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
                  onClick={handleAddStudent}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Student</span>
                </Button>
              )}
            </div>

            <StudentDataTable
              columns={columnsWithActions}
              data={paginatedStudents}
              isLoading={isLoading}
              pagination={{
                totalPages,
                currentPage: page,
                setPage,
                pageSize,
                setPageSize: handlePageSizeChange,
                totalElements,
              }}
            />
          </>
        )}

        {/* Add/Edit Student Modal */}
        {showModal && (
          <StudentFormModal
            form={form}
            isOpen={showModal}
            onClose={handleCloseModal}
            step={step}
            setStep={setStep}
            isEditing={isEditing}
            isLoadingStudent={isLoadingStudent}
            isSubmitting={isEditing ? updateStudentMutation.isPending : isSubmitting}
            validateStep={validateStep}
            onSubmit={onSubmit}
            languages={languages}
            cities={cities}
            academicLevels={academicLevels}
            disabilities={disabilities}
            marginalizedGroups={marginalizedGroups}
          />
        )}


        <DeleteStudentDialog
          isOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          student={studentToDelete}
          onConfirmDelete={confirmDelete}
          isDeleting={deleteStudentMutation.isPending}
        />
      </div>
    </div>
  );
} 