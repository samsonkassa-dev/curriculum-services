"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { useStudents, useAddStudent, useStudentById, useUpdateStudent, useDeleteStudent, useBulkDeleteStudents, useBulkImportStudentsByName, Student, CreateStudentData, CreateStudentByNameData, StudentFilters } from "@/lib/hooks/useStudents"
import { toast } from "sonner"
import { Plus, Upload, ArrowLeft, Trash2 } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { studentColumns, createActionsColumn, createStudentColumnsWithSelection } from "./students/student-columns"
import { StudentDataTable } from "./students/student-data-table"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { studentFormSchema, StudentFormValues } from "../students/add/components/formSchemas"
import { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { StudentFormModal } from "./students/student-form-modal"
import { DeleteStudentDialog } from "./students/delete-student-dialog"
import { CSVImportContent } from "./students/csv-import-content"
import { StudentFilter } from "./students/student-filter"

interface StudentsComponentProps {
  trainingId: string
}

export function StudentsComponent({ trainingId }: StudentsComponentProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showImportView, setShowImportView] = useState(false)
  const [step, setStep] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [filters, setFilters] = useState<StudentFilters>({})
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  const { isProjectManager, isTrainingAdmin, isCompanyAdmin } = useUserRole()
  
  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [filters]);
  
  // Main students query with search and filters
  const { data, isLoading } = useStudents(trainingId, page, pageSize, undefined, undefined, debouncedSearch, memoizedFilters)
  
  // Query to check if there are any students at all (without search and filters)
  // Only fetch when we don't have a search query or filters to determine initial empty state
  const shouldFetchAllStudents = !debouncedSearch.trim() && Object.keys(memoizedFilters).length === 0
  const { data: allStudentsData, isLoading: isLoadingAllStudents } = useStudents(
    shouldFetchAllStudents ? trainingId : '', // Only fetch when needed
    1, 
    1, 
    undefined, 
    undefined, 
    "", // No search query
    {} // No filters
  )
  
  const { 
    countries,
    regions,
    zones,
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
  const bulkDeleteMutation = useBulkDeleteStudents()
  const bulkImportMutation = useBulkImportStudentsByName()

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: undefined,
      dateOfBirth: undefined,
      hasSmartphone: false,
      smartphoneOwner: "",
      email: "",
      contactPhone: "",
      countryId: "",
      regionId: "",
      zoneId: "",
      cityId: "",
      woreda: "",
      houseNumber: "",
      languageId: "",
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

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (debouncedSearch !== searchQuery) return; // Only run when debounced search actually changes
    setPage(1);
  }, [debouncedSearch]);

  // Calculate selected students count
  const selectedStudentsCount = Object.keys(rowSelection).length;

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
      firstName: student.firstName || "",
      middleName: student.middleName || "",
      lastName: student.lastName || "",
      email: student.email || "",
      contactPhone: student.contactPhone || "",
      dateOfBirth: dateOfBirth,
      gender: (() => {
        if (!student.gender) return undefined;
        const normalized = student.gender.trim().toUpperCase();
        return (normalized === "MALE" || normalized === "FEMALE") ? (normalized as "MALE" | "FEMALE") : undefined;
      })(),
      countryId: student.city?.zone?.region?.country?.id || student.zone?.region?.country?.id || undefined,
      regionId: student.city?.zone?.region?.id || student.zone?.region?.id || undefined,
      zoneId: student.city?.zone?.id || student.zone?.id || undefined,
      cityId: student.city?.id || undefined,
      woreda: student.woreda || "",
      houseNumber: student.houseNumber || "",
      languageId: student.language?.id ?? undefined,
      academicLevelId: student.academicLevel?.id || undefined,
      fieldOfStudy: student.fieldOfStudy || "",
      hasSmartphone: student.hasSmartphone || false,
      smartphoneOwner: "",
      hasTrainingExperience: student.hasTrainingExperience || false,
      trainingExperienceDescription: student.trainingExperienceDescription || "",
      emergencyContactName: student.emergencyContactName || "",
      emergencyContactPhone: student.emergencyContactPhone || "",
      emergencyContactRelationship: student.emergencyContactRelationship || "",
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
        firstName: studentFormData.firstName,
        middleName: studentFormData.middleName,
        lastName: studentFormData.lastName,
        email: studentFormData.email,
        contactPhone: studentFormData.contactPhone,
        dateOfBirth: studentFormData.dateOfBirth,
        gender: studentFormData.gender,
        countryId: studentFormData.countryId,
        regionId: studentFormData.regionId,
        zoneId: studentFormData.zoneId,
        cityId: studentFormData.cityId,
        woreda: studentFormData.woreda,
        houseNumber: studentFormData.houseNumber,
        languageId: studentFormData.languageId,
        academicLevelId: studentFormData.academicLevelId,
        fieldOfStudy: studentFormData.fieldOfStudy,
        hasSmartphone: studentFormData.hasSmartphone,
        smartphoneOwner: studentFormData.smartphoneOwner,
        hasTrainingExperience: studentFormData.hasTrainingExperience,
        trainingExperienceDescription: studentFormData.trainingExperienceDescription,
        emergencyContactName: studentFormData.emergencyContactName,
        emergencyContactPhone: studentFormData.emergencyContactPhone,
        emergencyContactRelationship: studentFormData.emergencyContactRelationship,
        hasDisability: studentFormData.hasDisability,
        disabilityIds: studentFormData.disabilityIds,
        belongsToMarginalizedGroup: studentFormData.belongsToMarginalizedGroup,
        marginalizedGroupIds: studentFormData.marginalizedGroupIds,
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
      middleName: "",
      lastName: "",
      gender: undefined,
      dateOfBirth: undefined,
      hasSmartphone: false,
      smartphoneOwner: "",
      email: "",
      contactPhone: "",
      countryId: "",
      regionId: "",
      zoneId: "",
      cityId: "",
      woreda: "",
      houseNumber: "",
      languageId: "",
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

  const handleShowImport = useCallback(() => {
    setShowImportView(true);
  }, []);

  const handleBackFromImport = useCallback(() => {
    setShowImportView(false);
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
          "countryId",
          "regionId",
          "zoneId",
          "cityId", 
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

  const convertToCreateStudentData = useCallback((values: StudentFormValues): CreateStudentData => {
    // Format date to YYYY-MM-DD string
    const formattedDateOfBirth = values.dateOfBirth instanceof Date
      ? values.dateOfBirth.toISOString().split('T')[0]
      : ""; 
    
    return {
      firstName: values.firstName,
      middleName: values.middleName || undefined,
      lastName: values.lastName,
      email: values.email,
      contactPhone: values.contactPhone,
      dateOfBirth: formattedDateOfBirth,
      gender: values.gender as "MALE" | "FEMALE",
      zoneId: values.zoneId || "",
      cityId: values.cityId || "",
      woreda: values.woreda,
      houseNumber: values.houseNumber,
      languageId: values.languageId || "",
      academicLevelId: values.academicLevelId || "",
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
  }, []);

  const handleCSVImport = useCallback(async (students: CreateStudentByNameData[]) => {
    try {
      // Use the async version to wait for completion
      await bulkImportMutation.bulkImportByNameAsync({ trainingId, studentsData: students })
      // Only close import view after successful completion
      setShowImportView(false)
    } catch (error) {
      console.log("CSV import failed:", error)
      throw error // Re-throw to let CSVImportContent handle the error display
    }
  }, [bulkImportMutation, trainingId])

  const onSubmit = useCallback(async (values: StudentFormValues) => {
    const studentData = convertToCreateStudentData(values);

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
  }, [addStudent, convertToCreateStudentData, currentStudentId, isEditing, trainingId, updateStudentMutation]);

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
        console.log("Delete failed:", error);
      }
    }
  }, [deleteStudentMutation, studentToDelete]);


  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }, []);

  // Use server pagination data directly from the API response
  const paginationData = useMemo(() => {
    return {
      students: data?.trainees || [],
      totalPages: data?.totalPages || 0,
      totalElements: data?.totalElements || 0,
      currentPage: data?.currentPage || 1
    };
  }, [data]);

  const handleBulkDelete = useCallback(async () => {
    const selectedIndices = Object.keys(rowSelection);
    if (selectedIndices.length === 0) return;

    // Get the selected student IDs
    const selectedStudentIds = selectedIndices
      .map(index => {
        const student = paginationData.students[parseInt(index)];
        return student?.id;
      })
      .filter(Boolean) as string[];

    if (selectedStudentIds.length === 0) {
      toast.error('No valid students selected for deletion');
      return;
    }

    // Open the delete dialog instead of browser confirm
    setBulkDeleteDialogOpen(true);
  }, [rowSelection, paginationData.students]);

  const confirmBulkDelete = useCallback(async () => {
    const selectedIndices = Object.keys(rowSelection);
    const selectedStudentIds = selectedIndices
      .map(index => {
        const student = paginationData.students[parseInt(index)];
        return student?.id;
      })
      .filter(Boolean) as string[];

    try {
      await bulkDeleteMutation.mutateAsync(selectedStudentIds);
      setRowSelection({}); // Clear selection after successful delete
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.log("Bulk delete failed:", error);
    }
  }, [rowSelection, paginationData.students, bulkDeleteMutation]);

  // Add the actions column to the existing columns
  const columnsWithActions = useMemo<ColumnDef<Student>[]>(() => {
    // Always use selection-enabled columns when user has edit permission
    const hasEditPermission = isCompanyAdmin || isProjectManager || isTrainingAdmin;
    const baseColumns = hasEditPermission 
      ? createStudentColumnsWithSelection()
      : [...studentColumns];
    
    // Add the actions column only if user has appropriate permissions
    if (hasEditPermission) {
      baseColumns.push(createActionsColumn(handleEditStudent, handleDeleteStudent, hasEditPermission));
    }
    
    return baseColumns;
  }, [handleEditStudent, handleDeleteStudent, isCompanyAdmin, isProjectManager, isTrainingAdmin]);

  // Check if user has permissions to edit
  const hasEditPermission = useMemo(() => {
    return isCompanyAdmin || isProjectManager || isTrainingAdmin;
  }, [isCompanyAdmin, isProjectManager, isTrainingAdmin]);

  // Determine if we should show the empty state (only when no search, no filters, and no students exist at all)
  const shouldShowEmptyState = useMemo(() => {
    const hasNoSearchQuery = !debouncedSearch.trim();
    const hasNoFilters = Object.keys(memoizedFilters).length === 0;
    const hasNoStudentsAtAll = allStudentsData?.totalElements === 0;
    return hasNoSearchQuery && hasNoFilters && hasNoStudentsAtAll;
  }, [debouncedSearch, memoizedFilters, allStudentsData?.totalElements]);

  // Handle filter application
  const handleApplyFilters = useCallback((newFilters: StudentFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const emptyState = useMemo(() => (
        <div className="text-center py-40 bg-[#fbfbfb] rounded-lg border-[0.1px]">
          <h3 className="text-lg font-medium mb-2">No Student Added Yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            This specifies the core teaching methods used to deliver content and facilitate learning.
          </p>
          {hasEditPermission && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
                onClick={handleAddStudent}
              >
                <Plus className="h-4 w-4" />
                <span>Add Student</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleShowImport}
              >
                <Upload className="h-4 w-4" />
                <span>Import CSV</span>
              </Button>
            </div>
          )}
        </div>
  ), [handleAddStudent, hasEditPermission, handleShowImport]);

  // Show loading only for initial load (when checking if any students exist)
  if (isLoadingAllStudents && !allStudentsData) {
    return <Loading />
  }

  return (
    <div className="flex lg:px-16 md:px-14 px-4 w-full">
      <div className="flex-1 py-4 md:pl-12 min-w-0">
        {showImportView ? (
          <>
            {/* Import View Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={handleBackFromImport}
                className="flex items-center gap-2 text-brand hover:text-brand-dark"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Students
              </Button>
              <h1 className="text-lg font-semibold">Import Students from CSV</h1>
            </div>

            {/* CSV Import Content */}
            <CSVImportContent
              onImport={handleCSVImport}
              isSubmitting={bulkImportMutation.isLoading}
              languages={languages || []}
              countries={countries || []}
              regions={regions || []}
              zones={zones || []}
              cities={cities || []}
              academicLevels={academicLevels || []}
              disabilities={disabilities || []}
              marginalizedGroups={marginalizedGroups || []}
            />
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold mb-6">Students</h1>

            {shouldShowEmptyState ? (
              emptyState
            ) : (
              <>


                {/* Always show search bar and buttons when there are students or user has edit permission */}
                <div className="flex items-center lg:justify-end gap-3 mb-6">
                  <div className="flex items-center gap-3">
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
                    
                    {/* Filter Component */}
                    <StudentFilter
                      countries={countries}
                      regions={regions}
                      zones={zones}
                      languages={languages}
                      academicLevels={academicLevels}
                      onApply={handleApplyFilters}
                      defaultSelected={memoizedFilters}
                    />
                  </div>
                  
                  {hasEditPermission && (
                    <div className="flex gap-2">
                      {/* Delete Button - only show when multiple students selected */}
                      {selectedStudentsCount > 1 && (
                        <Button
                          variant="destructive"
                          className="flex items-center gap-2"
                          onClick={handleBulkDelete}
                          disabled={bulkDeleteMutation.isPending}
                        >
                          {bulkDeleteMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Delete {selectedStudentsCount} Students
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleShowImport}
                      >
                        <Upload className="h-4 w-4" />
                        <span>Import CSV</span>
                      </Button>
                      <Button
                        className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white flex items-center gap-2"
                        onClick={handleAddStudent}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Student</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Always show the table - it handles its own loading and empty states */}
                <StudentDataTable
                  columns={columnsWithActions}
                  data={paginationData.students}
                  isLoading={isLoading}
                  pagination={{
                    totalPages: paginationData.totalPages,
                    currentPage: paginationData.currentPage,
                    setPage,
                    pageSize,
                    setPageSize: handlePageSizeChange,
                    totalElements: paginationData.totalElements,
                  }}
                  rowSelection={hasEditPermission ? rowSelection : {}}
                  onRowSelectionChange={hasEditPermission ? setRowSelection : undefined}
                />
              </>
            )}
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
            countries={countries}
            regions={regions}
            zones={zones}
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

        {/* Bulk Delete Dialog */}
        <DeleteStudentDialog
          isOpen={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          student={null} // We pass null for bulk delete
          onConfirmDelete={confirmBulkDelete}
          isDeleting={bulkDeleteMutation.isPending}
          title={`Delete ${selectedStudentsCount} Students`}
          description={`Are you sure you want to delete these ${selectedStudentsCount} students? This action cannot be undone.`}
        />
      </div>
    </div>
  );
} 