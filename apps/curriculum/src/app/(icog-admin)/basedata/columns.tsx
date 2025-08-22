"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { LOCALIZABLE_TYPES } from "@/types/base-data"
import { ActionCell } from './components/action-cell'

export type BaseData = {
  id: string
  name: string
  description: string
  range?: string
  technologicalRequirementType?: string
  assessmentSubType?: string
  alternateNames?: {
    [languageCode: string]: string;
  };
}

export const columns = (activeTab: string): ColumnDef<BaseData>[] => {
  const baseColumns: ColumnDef<BaseData>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Description",
    },
  ];

  // Add alternate names column for localizable types
  if (LOCALIZABLE_TYPES.includes(activeTab as any)) {
    baseColumns.splice(2, 0, {
      accessorKey: "alternateNames",
      header: "Alternate Names",
      cell: ({ row }) => {
        const alternateNames = row.getValue("alternateNames") as { [key: string]: string } | undefined;
        if (!alternateNames || Object.keys(alternateNames).length === 0) {
          return <div className="text-gray-400">-</div>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(alternateNames).map(([langCode, name]) => (
              <Badge key={langCode} variant="secondary" className="text-xs">
                {langCode}: {name}
              </Badge>
            ))}
          </div>
        );
      },
    });
  }

  // Add specific columns based on active tab
  if (activeTab === 'age-group') {
    baseColumns.splice(1, 0, {
      accessorKey: "range",
      header: "Age Range",
    });
  }

  if (activeTab === 'technological-requirement') {
    baseColumns.splice(1, 0, {
      accessorKey: "technologicalRequirementType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("technologicalRequirementType") as string;
        return <div>{type === "LEARNER" ? "Learner" : "Instructor"}</div>;
      }
    });
  }

  if (activeTab === 'assessment-type') {
    baseColumns.splice(1, 0, {
      accessorKey: "assessmentSubType",
      header: "Assessment Sub Type",
      cell: ({ row }) => {
        const type = row.getValue("assessmentSubType") as string;
        const formattedType = type
          .split('_')
          .map(word => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' ');
        return <div>{formattedType}</div>;
      }
    });
  }

  // Always add actions as the last column
  baseColumns.push({
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: (props) => <ActionCell {...props} activeTab={activeTab} />
  });

  return baseColumns;
} 