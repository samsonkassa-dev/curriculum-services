"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { BaseDataItem, BaseDataType } from "@/types/base-data"
import { Textarea } from "@/components/ui/textarea"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BaseDataOptions } from "@/types/base-data"

interface AddDataDialogProps {
  onAddData?: (data: { name: string; description: string; countryId?: string }) => void;
  onUpdateData?: (data: { name: string; description: string; countryId?: string }) => void;
  initialData?: BaseDataItem & { countryId?: string };
  isLoading?: boolean;
  mode?: 'add' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  type?: BaseDataType;
}

export function AddDataDialog({ 
  onAddData, 
  onUpdateData,
  initialData,
  isLoading,
  mode = 'add',
  open,
  onOpenChange,
  type
}: AddDataDialogProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [countryId, setCountryId] = useState(initialData?.countryId || "")
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch countries if we're adding/editing a city
  const { data: countries } = useBaseData('country', { enabled: type === 'city' } as BaseDataOptions)

  const actualOpen = open ?? dialogOpen;
  const actualOnOpenChange = onOpenChange ?? setDialogOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name,
      description,
      ...(type === 'city' && { countryId })
    }

    if (mode === 'edit' && onUpdateData) {
      onUpdateData(data)
    } else if (onAddData) {
      onAddData(data)
    }
    actualOnOpenChange(false)
  }

  return (
    <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
      {mode === 'add' && (
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
            <Plus className="h-4 w-4 mr-2" />
            Add Data
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-full max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 border-b-[0.3px] border-[#CED4DA] pb-4">
          <DialogTitle>{mode === 'add' ? 'Add Row' : 'Edit Row'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 p-10">
          <div className="grid gap-2 px-5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="h-9"
            />
          </div>

          {type === 'city' && (
            <div className="grid gap-2 px-5">
              <Label htmlFor="country">Country</Label>
              <Select value={countryId} onValueChange={setCountryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country: BaseDataItem) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2 px-5 pt-5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="flex justify-center gap-5 mt-8">
            <Button type="button" variant="outline" onClick={() => actualOnOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (type === 'city' && !countryId)} 
              className="bg-brand text-white hover:bg-brand/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {mode === 'add' ? 'Save' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 