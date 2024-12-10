"use client"

import { ColumnDef } from "@tanstack/react-table"

import { ActionCell } from './components/action-cell'

export type BaseData = {
  id: string
  name: string
  description: string
}

export const columns = (activeTab: string): ColumnDef<BaseData>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: (props) => <ActionCell {...props} activeTab={activeTab} />
  },
] 