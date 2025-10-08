import { Cohort } from "@/lib/hooks/useCohorts"

/**
 * Recursively finds the last leaf sub-cohort in a cohort tree.
 * A leaf cohort is one that has no sub-cohorts or has an empty sub-cohorts array.
 * 
 * @param cohort - The cohort to traverse
 * @returns The last leaf sub-cohort, or the original cohort if it has no children
 * 
 * @example
 * // Cohort A -> Cohort B -> Cohort C (C has no children)
 * // Returns Cohort C
 * 
 * // Cohort A (no children)
 * // Returns Cohort A
 */
export function getLastLeafCohort(cohort: Cohort): Cohort {
  // Base case: if no subCohorts or empty array, this is a leaf
  if (!cohort.subCohorts || cohort.subCohorts.length === 0) {
    return cohort
  }
  
  // Recursive case: get the last sub-cohort and traverse it
  const lastSubCohort = cohort.subCohorts[cohort.subCohorts.length - 1]
  return getLastLeafCohort(lastSubCohort)
}

/**
 * Flattens a cohort tree and returns all leaf cohorts (cohorts with no children)
 * 
 * @param cohorts - Array of cohorts to process
 * @returns Array of all leaf cohorts found in the tree
 */
export function getAllLeafCohorts(cohorts: Cohort[]): Cohort[] {
  const leaves: Cohort[] = []
  
  function traverse(cohort: Cohort) {
    if (!cohort.subCohorts || cohort.subCohorts.length === 0) {
      // This is a leaf, add it to the list
      leaves.push(cohort)
    } else {
      // Not a leaf, traverse all children
      cohort.subCohorts.forEach(traverse)
    }
  }
  
  cohorts.forEach(traverse)
  return leaves
}

/**
 * Gets the display name for a cohort including its hierarchy
 * 
 * @param cohort - The cohort to get the display name for
 * @returns String like "Parent > Child > GrandChild"
 */
export function getCohortHierarchyName(cohort: Cohort): string {
  const parts: string[] = []
  
  if (cohort.parentCohortName) {
    parts.push(cohort.parentCohortName)
  }
  
  parts.push(cohort.name)
  
  return parts.join(' > ')
}

