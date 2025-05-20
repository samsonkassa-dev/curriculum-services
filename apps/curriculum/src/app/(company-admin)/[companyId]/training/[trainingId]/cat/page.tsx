"use client"

import { CatComponent } from "../components/cat"
import { useParams } from "next/navigation"

export default function CatPage() {
  const params = useParams()
  const trainingId = params.trainingId as string
  
  return <CatComponent trainingId={trainingId} />
} 