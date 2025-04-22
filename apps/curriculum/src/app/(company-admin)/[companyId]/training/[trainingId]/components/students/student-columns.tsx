"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Student } from "@/lib/hooks/useStudents"
import { format } from "date-fns"

export const studentColumns: ColumnDef<Student>[] = [
  {
    id: "name",
    header: "Full Name",
    cell: ({ row }) => {
      const student = row.original
      
      // Get display name
      const name = `${student?.firstName || ''} ${student?.lastName || ''}`.trim()
      
      // Get initials for the avatar
      const initials = name
        .split(' ')
        .map(n => n?.[0] || '')
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return <span className="text-gray-500">{row.original.email || "N/A"}</span>
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