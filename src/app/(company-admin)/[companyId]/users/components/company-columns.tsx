"use client"

import { ColumnDef } from "@tanstack/react-table"
import { TrainingUser } from "@/types/users"

export const companyColumns: ColumnDef<TrainingUser>[] = [
  {
    id: "user",
    header: "Users",
    cell: ({ row }) => {
      const user = row.original
      
      // Get display name based on available data
      let name: string
      if (user?.firstName && user?.lastName) {
        // If we have both first and last name, use them
        name = `${user?.firstName} ${user?.lastName}`.trim()
      } else {
        // Otherwise fall back to email-based name
        const emailName = user?.email?.split('@')[0] || ''
        name = emailName
          .split('.')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }

      // Get initials from the name
      const initials = name
        .split(' ')
        .map(n => n?.[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2)
      
      return (
        <div className="flex items-center gap-3">
          {user.profilePictureUrl ? (
            <img 
              src={user.profilePictureUrl} 
              alt={name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement?.querySelector('.initials-fallback')?.classList.remove('hidden')
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium initials-fallback">
              {initials}
            </div>
          )}
          <span className="font-medium">{name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => row.original.phoneNumber || "N/A"
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || "N/A"
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role
      if (!role) return "No Role Assigned"
      
      // Display role name with color badge
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor:  '#DDEB9D' }} 
          />
          <span>{role.name}</span>
        </div>
      )
    }
  }
] 