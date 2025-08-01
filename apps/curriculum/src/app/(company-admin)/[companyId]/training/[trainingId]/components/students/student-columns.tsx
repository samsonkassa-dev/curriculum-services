"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Student, useUploadConsentForm } from "@/lib/hooks/useStudents"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Upload, FileText, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Base student columns without selection - for when selection is not needed
export const studentColumnsBase: ColumnDef<Student>[] = [
  {
    id: "name",
    header: "Full Name",
    cell: ({ row }) => {
      const student = row.original
      
      // Get display name including middle name if it exists
      const nameParts = [
        student?.firstName || '',
        student?.middleName || '',
        student?.lastName || ''
      ].filter(Boolean) // Remove empty parts
      
      const name = nameParts.join(' ').trim()
      
      // Get initials for the avatar from first and last name primarily
      const initials = [
        student?.firstName?.[0] || '',
        student?.lastName?.[0] || student?.middleName?.[0] || ''
      ].filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
      
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100/60 text-blue-600 flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
          <span className="font-medium text-gray-900">{name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "contactPhone",
    header: "Phone Number",
    cell: ({ row }) => {
      return <span className="text-gray-500">{row.original.contactPhone || "N/A"}</span>
    }
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date",
    cell: ({ row }) => {
      const dob = row.original.dateOfBirth
      if (!dob) return <span className="text-gray-500">N/A</span>
      
      try {
        return <span className="text-gray-500">{format(new Date(dob), "dd MMM yyyy")}</span>
      } catch (error) {
        return <span className="text-gray-500">Invalid date</span>
      }
    }
  },
  {
    id: "language",
    header: "Language",
    cell: ({ row }) => {
      const language = row.original.language?.name
      
      return (
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
            bg-blue-50 text-blue-700`}>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{language || "Not specified"}</span>
          </div>
        </div>
      )
    }
  },
  {
    id: "trainingExperience",
    header: "Training Experience",
    cell: ({ row }) => {
      const hasExperience = row.original.hasTrainingExperience
      const experienceStatus = hasExperience ? "experienced" : "new"
      
      return (
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
            ${hasExperience ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            <div className={`w-1.5 h-1.5 rounded-full 
              ${hasExperience ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="capitalize">{experienceStatus}</span>
          </div>
        </div>
      )
    }
  }
]

// Student columns with selection checkbox
export const createStudentColumnsWithSelection = (): ColumnDef<Student>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label="Select all students"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={`Select ${row.original.firstName} ${row.original.lastName}`}
      />
    ),
  },
  ...studentColumnsBase
]

// Default export maintains backward compatibility
export const studentColumns = studentColumnsBase

// Creates the actions column with passed-in handler functions
export const createActionsColumn = (
  handleEditStudent: (student: Student) => void,
  handleDeleteStudent: (student: Student) => void,
  hasEditPermission: boolean
): ColumnDef<Student> => ({
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const student = row.original;
    
    if (!hasEditPermission) {
      return null;
    }
    
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleEditStudent(student)}
          className="h-8 w-8 p-0"
          title="Edit"
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleDeleteStudent(student)}
          className="h-8 w-8 p-0"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    )
  }
})

// Creates a remove column specifically for removing students from cohorts
// ConsentFormCell component for handling upload and display
interface ConsentFormCellProps {
  student: Student;
}

export const ConsentFormCell = ({ student }: ConsentFormCellProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadConsentForm } = useUploadConsentForm();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setIsUploading(true);
      await uploadConsentForm({ id: student.id, consentFormFile: file });
    } catch (error) {
      console.error('Error uploading consent form:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // If student already has a consent form
  if (student.consentFormUrl) {
    return (
      <div className="flex items-center">
        <a 
          href={student.consentFormUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 underline"
        >
          <FileText className="h-4 w-4" />
          <span>View Form</span>
        </a>
      </div>
    );
  }

  // If no consent form uploaded yet
  return (
    <div className="flex items-center">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*"
        className="hidden"
        aria-label="Upload consent form" 
        title="Upload consent form"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={triggerFileInput}
        disabled={isUploading}
        className={cn(
          "flex items-center gap-1.5 text-gray-600 hover:text-blue-600",
          isUploading && "opacity-70 cursor-not-allowed"
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Upload Consent</span>
          </>
        )}
      </Button>
    </div>
  );
};

// Create a column for the consent form
export const createConsentFormColumn = (): ColumnDef<Student> => ({
  id: "consentForm",
  header: "Consent Form",
  cell: ({ row }) => {
    return <ConsentFormCell student={row.original} />;
  }
});

export const createRemoveFromCohortColumn = (
  handleRemoveStudent: (student: Student) => void,
  hasRemovePermission: boolean,
  isRemoving?: boolean
): ColumnDef<Student> => ({
  id: "remove",
  header: "Actions",
  cell: ({ row }) => {
    const student = row.original;
    
    if (!hasRemovePermission) {
      return null;
    }
    
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleRemoveStudent(student)}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          title="Remove from Cohort"
          disabled={isRemoving}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }
}) 