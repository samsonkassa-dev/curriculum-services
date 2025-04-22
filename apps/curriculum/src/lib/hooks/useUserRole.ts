"use client";

import { useAuth } from "./useAuth";

// Roles constants
export const ROLE_COMPANY_ADMIN = "ROLE_COMPANY_ADMIN";
export const ROLE_CURRICULUM_ADMIN = "ROLE_CURRICULUM_ADMIN";
export const ROLE_SUB_CURRICULUM_ADMIN = "ROLE_SUB_CURRICULUM_ADMIN";
export const ROLE_CONTENT_DEVELOPER = "ROLE_CONTENT_DEVELOPER";
export const ROLE_ICOG_ADMIN = "ROLE_ICOG_ADMIN";
export const ROLE_PROJECT_MANAGER = "ROLE_PROJECT_MANAGER";
export const ROLE_TRAINING_ADMIN = "ROLE_TRAINING_ADMIN";
export const ROLE_TRAINER_ADMIN = "ROLE_TRAINER_ADMIN";
export const ROLE_TRAINER = "ROLE_TRAINER";
export const ROLE_ME_EXPERT = "ROLE_ME_EXPERT";

/**
 * Custom hook to manage user role
 * Simplified to use the useAuth hook
 */
export function useUserRole() {
  const { user, isLoading } = useAuth();
  const role = user?.role || null;

  // Role check helper functions
  const isCompanyAdmin = role === ROLE_COMPANY_ADMIN;
  const isCurriculumAdmin = role === ROLE_CURRICULUM_ADMIN;
  const isSubCurriculumAdmin = role === ROLE_SUB_CURRICULUM_ADMIN;
  const isContentDeveloper = role === ROLE_CONTENT_DEVELOPER;
  const isIcogAdmin = role === ROLE_ICOG_ADMIN;
  const isProjectManager = role === ROLE_PROJECT_MANAGER;
  const isTrainingAdmin = role === ROLE_TRAINING_ADMIN;
  const isTrainerAdmin = role === ROLE_TRAINER_ADMIN;
  const isTrainer = role === ROLE_TRAINER;
  const isMeExpert = role === ROLE_ME_EXPERT;

  // Check if user can edit content based on role
  const canEdit = isCompanyAdmin || isCurriculumAdmin || isSubCurriculumAdmin;

  return {
    role,
    isLoading,
    isCompanyAdmin,
    isCurriculumAdmin,
    isSubCurriculumAdmin,
    isContentDeveloper,
    isIcogAdmin,
    isProjectManager,
    isTrainingAdmin,
    isTrainerAdmin,
    isTrainer,
    isMeExpert,
    canEdit
  };
} 