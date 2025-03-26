"use client"

import { ColumnDef } from "@tanstack/react-table"

import { ActionCell } from './components/action-cell'

export type BaseData = {
  id: string
  name: string
  description: string
  range?: string
  technologicalRequirementType?: string
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

  // Always add actions as the last column
  baseColumns.push({
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: (props) => <ActionCell {...props} activeTab={activeTab} />
  });

  return baseColumns;
} 