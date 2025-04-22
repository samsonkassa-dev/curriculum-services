"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useModulesByTrainingId } from "./useModule"
import { useGetLessons, Lesson } from "./useLesson"

export function useTrainingLessons(trainingId: string) {
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [isLoadingLessons, setIsLoadingLessons] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // Get all modules for this training
  const { 
    data: modulesData, 
    isLoading: isLoadingModules,
    error: modulesError 
  } = useModulesByTrainingId(trainingId)
  
  // Effect to fetch lessons for each module
  useEffect(() => {
    if (!modulesData || isLoadingModules || modulesError) return
    
    const modules = modulesData.modules || []
    if (modules.length === 0) {
      setAllLessons([])
      setIsLoadingLessons(false)
      return
    }
    
    // This will hold all the promises for fetching lessons for each module
    const lessonPromises = modules.map(module => {
      return new Promise<Lesson[]>((resolve, reject) => {
        // Get the module's lessons
        fetch(`${process.env.NEXT_PUBLIC_API}/lesson/module/${module.id}`, {
          headers: {
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch lessons for module ${module.id}`)
            }
            return response.json()
          })
          .then(data => {
            resolve(data.lessons || [])
          })
          .catch(err => {
            reject(err)
          })
      })
    })
    
    setIsLoadingLessons(true)
    
    // Execute all promises and combine the results
    Promise.all(lessonPromises)
      .then(results => {
        // Flatten array of arrays into a single array
        const combinedLessons = results.flat()
        setAllLessons(combinedLessons)
        setIsLoadingLessons(false)
      })
      .catch(err => {
        setError(err)
        setIsLoadingLessons(false)
      })
  }, [modulesData, isLoadingModules, modulesError])
  
  return {
    lessons: allLessons,
    isLoading: isLoadingModules || isLoadingLessons,
    error: modulesError || error
  }
} 