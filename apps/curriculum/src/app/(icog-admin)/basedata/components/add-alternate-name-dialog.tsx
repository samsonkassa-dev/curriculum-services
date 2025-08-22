"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Languages, Loader2 } from "lucide-react";
import { useState } from "react";
import { BaseDataType, AlternateLanguageName } from "@/types/base-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Common language codes for Ethiopia
const LANGUAGE_CODES = [
  { value: "am", label: "Amharic (am)" },
  { value: "om", label: "Oromo (om)" },
  { value: "ti", label: "Tigrinya (ti)" },
  { value: "so", label: "Somali (so)" },
  { value: "aa", label: "Afar (aa)" },
  { value: "sid", label: "Sidamo (sid)" },
  { value: "wo", label: "Wolaytta (wo)" },
  { value: "gez", label: "Ge'ez (gez)" },
  { value: "gu", label: "Gurage (gu)" },
  { value: "har", label: "Harari (har)" },
  { value: "en", label: "English (en)" },
];

interface AddAlternateNameDialogProps {
  itemId: string;
  itemName: string;
  type: BaseDataType;
  onAddAlternateName: (data: { itemId: string; languageData: AlternateLanguageName }, onSuccess?: () => void) => void;
  isLoading?: boolean;
  existingLanguages?: string[];
}

export function AddAlternateNameDialog({
  itemId,
  itemName,
  type,
  onAddAlternateName,
  isLoading,
  existingLanguages = [],
}: AddAlternateNameDialogProps) {
  const [languageCode, setLanguageCode] = useState("");
  const [otherLanguageName, setOtherLanguageName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const resetForm = () => {
    setLanguageCode("");
    setOtherLanguageName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAlternateName({
      itemId,
      languageData: {
        languageCode,
        otherLanguageName,
      },
    }, () => {
      // Only close modal and reset form on success
      resetForm();
      setDialogOpen(false);
    });
  };

  const isSubmitDisabled = () => {
    if (isLoading) return true;
    if (!languageCode || !otherLanguageName) return true;
    if (existingLanguages.includes(languageCode)) return true;
    return false;
  };

  const availableLanguages = LANGUAGE_CODES.filter(
    (lang) => !existingLanguages.includes(lang.value)
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
        >
          <Languages className="h-4 w-4 mr-1" />
          Add Language
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md p-0">
        <DialogHeader className="px-6 pt-6 border-b-[0.3px] border-[#CED4DA] pb-4">
          <DialogTitle>
            Add Alternate Language Name
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Adding alternate name for: <span className="font-medium">{itemName}</span>
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 p-6">
          <div className="grid gap-2">
            <Label htmlFor="languageCode">Language</Label>
            <Select value={languageCode} onValueChange={setLanguageCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableLanguages.length === 0 && (
              <p className="text-sm text-gray-500">
                All supported languages already have alternate names.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="otherLanguageName">Alternate Name</Label>
            <Input
              id="otherLanguageName"
              value={otherLanguageName}
              onChange={(e) => setOtherLanguageName(e.target.value)}
              placeholder="Enter alternate name"
              className="h-9"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitDisabled()}
              className="bg-brand text-white hover:bg-brand/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
