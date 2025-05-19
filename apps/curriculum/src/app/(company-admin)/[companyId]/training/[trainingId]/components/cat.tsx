"use client"

import { CatView } from "./cat/catView"

interface CatComponentProps {
  trainingId: string
}

export function CatComponent({ trainingId }: CatComponentProps) {
  return <CatView trainingId={trainingId} />
}
