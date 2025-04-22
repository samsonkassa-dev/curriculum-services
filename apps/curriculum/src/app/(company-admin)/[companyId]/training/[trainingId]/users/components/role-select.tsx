import { Role } from "@/types/users"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useChangeUserRole } from "@/lib/hooks/useInviteTrainingUser"

interface RoleSelectProps {
  currentRole: Role
  userId: string
  onRoleChange?: (newRole: string) => void
}

export function RoleSelect({ currentRole, userId, onRoleChange }: RoleSelectProps) {
  const { mutate: changeRole, isPending } = useChangeUserRole()

  const handleRoleChange = (newRole: string) => {
    changeRole({ 
      userId, 
      newRole 
    })
    onRoleChange?.(newRole)
  }

  return (
    <Select
      defaultValue={currentRole.name}
      onValueChange={handleRoleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px] h-9 bg-[#e4e4e4] rounded-full border-0">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div 
              className=""
              style={{ backgroundColor: currentRole.colorCode }}
            />
            <span className="text-sm text-lowercase">
              {currentRole.name.replace('ROLE_', '').replace(/_/g, ' ').toLowerCase()}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ROLE_COMPANY_ADMIN">
          <div className="flex items-center gap-2">
            <div className="" />
            <span>Company Admin</span>
          </div>
        </SelectItem>
        <SelectItem value="ROLE_SUB_CURRICULUM_ADMIN">
          <div className="flex items-center gap-2">
            <div className="" />
            <span>Sub Curriculum Admin</span>
          </div>
        </SelectItem>
        <SelectItem value="ROLE_CURRICULUM_ADMIN">
          <div className="flex items-center gap-2">
            <div className="" />
            <span>Curriculum Admin</span>
          </div>
        </SelectItem>
        <SelectItem value="ROLE_CONTENT_DEVELOPER">
          <div className="flex items-center gap-2">
            <div className="" />
            <span>Content Developer</span>
          </div>
        </SelectItem>
        {/* Add other role options as needed */}
      </SelectContent>
    </Select>
  )
} 