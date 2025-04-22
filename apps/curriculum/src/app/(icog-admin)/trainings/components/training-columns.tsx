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
    accessorKey: "genderPercentages",
    header: "Gender Distribution",
    cell: ({ row }) => {
      const genderPercentages = row.getValue<Training["genderPercentages"]>("genderPercentages");
      return genderPercentages
        .map((item) => `${item.gender.charAt(0)}${item.gender.slice(1).toLowerCase()} (${item.percentage}%)`)
        .join(" | ");
    },
  },
  {
    id: "actions",
    cell: TrainingActionCell,
  },
];
