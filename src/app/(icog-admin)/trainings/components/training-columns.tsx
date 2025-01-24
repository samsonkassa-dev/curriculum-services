"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Training } from "@/types/training";
import { TrainingActionCell } from "./training-action-cell";

export const trainingColumns: ColumnDef<Training>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "cities",
    header: "City",
    cell: ({ row }) => {
      const cities = row.getValue<Training["cities"]>("cities");
      return cities.map((city) => city.name).join(", ");
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue<number>("duration");
      const durationType = row.original.durationType;
      return `${duration} ${durationType.toLowerCase()}`;
    },
  },
  {
    accessorKey: "ageGroups",
    header: "Age Groups",
    cell: ({ row }) => {
      const ageGroups = row.getValue<Training["ageGroups"]>("ageGroups");
      return ageGroups
        .map((group) => `${group.name} (${group.range})`)
        .join(", ");
    },
  },
  {
    accessorKey: "targetAudienceGenders",
    header: "Target Audience Genders",
    cell: ({ row }) => {
      const genders = row.getValue<Training["targetAudienceGenders"]>(
        "targetAudienceGenders"
      );
      return genders.join(", ");
    },
  },
  {
    id: "actions",
    cell: TrainingActionCell,
  },
];
