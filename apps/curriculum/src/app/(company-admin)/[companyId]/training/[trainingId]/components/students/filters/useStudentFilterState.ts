import { useState } from "react"
import { StudentFilters } from "@/lib/hooks/useStudents"

export function useStudentFilterState(defaultSelected: StudentFilters = {}) {
  // Basic filters
  const [selectedGenders, setSelectedGenders] = useState<string[]>(defaultSelected.genders || [])
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>(defaultSelected.languageIds || [])
  const [selectedAcademicLevelIds, setSelectedAcademicLevelIds] = useState<string[]>(defaultSelected.academicLevelIds || [])
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>(defaultSelected.zoneIds || [])
  
  // Location cascading states
  const [selectedCountryId, setSelectedCountryId] = useState("")
  const [selectedRegionId, setSelectedRegionId] = useState("")
  
  // Age filters
  const [ageAbove, setAgeAbove] = useState<number | undefined>(defaultSelected.ageAbove)
  const [ageBelow, setAgeBelow] = useState<number | undefined>(defaultSelected.ageBelow)
  
  // Consent form filter
  const [hasConsentForm, setHasConsentForm] = useState<boolean | undefined>(defaultSelected.hasConsentForm)
  
  // Cohort filters
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>(defaultSelected.cohortIds || [])
  
  // Attendance filters
  const [attendancePercentageAbove, setAttendancePercentageAbove] = useState<number | undefined>(defaultSelected.attendancePercentageAbove)
  const [attendancePercentageBelow, setAttendancePercentageBelow] = useState<number | undefined>(defaultSelected.attendancePercentageBelow)
  
  // Survey filters
  const [hasFilledBaselineSurvey, setHasFilledBaselineSurvey] = useState<boolean | undefined>(defaultSelected.hasFilledBaselineSurvey)
  const [hasFilledEndlineSurvey, setHasFilledEndlineSurvey] = useState<boolean | undefined>(defaultSelected.hasFilledEndlineSurvey)
  
  // Assessment filters
  const [hasPreAssessmentAttempt, setHasPreAssessmentAttempt] = useState<boolean | undefined>(defaultSelected.hasPreAssessmentAttempt)
  const [hasPostAssessmentAttempt, setHasPostAssessmentAttempt] = useState<boolean | undefined>(defaultSelected.hasPostAssessmentAttempt)
  const [preAssessmentScoreAbove, setPreAssessmentScoreAbove] = useState<number | undefined>(defaultSelected.preAssessmentScoreAbove)
  const [preAssessmentScoreBelow, setPreAssessmentScoreBelow] = useState<number | undefined>(defaultSelected.preAssessmentScoreBelow)
  const [postAssessmentScoreAbove, setPostAssessmentScoreAbove] = useState<number | undefined>(defaultSelected.postAssessmentScoreAbove)
  const [postAssessmentScoreBelow, setPostAssessmentScoreBelow] = useState<number | undefined>(defaultSelected.postAssessmentScoreBelow)

  // Certificate filters
  const [isCertified, setIsCertified] = useState<boolean | undefined>(defaultSelected.isCertified)
  const [isCertificateSmsSent, setIsCertificateSmsSent] = useState<boolean | undefined>(defaultSelected.isCertificateSmsSent)

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      selectedGenders.length > 0 ||
      selectedLanguageIds.length > 0 ||
      selectedAcademicLevelIds.length > 0 ||
      selectedZoneIds.length > 0 ||
      ageAbove !== undefined ||
      ageBelow !== undefined ||
      hasConsentForm !== undefined ||
      selectedCohortIds.length > 0 ||
      attendancePercentageAbove !== undefined ||
      attendancePercentageBelow !== undefined ||
      hasFilledBaselineSurvey !== undefined ||
      hasFilledEndlineSurvey !== undefined ||
      hasPreAssessmentAttempt !== undefined ||
      hasPostAssessmentAttempt !== undefined ||
      preAssessmentScoreAbove !== undefined ||
      preAssessmentScoreBelow !== undefined ||
      postAssessmentScoreAbove !== undefined ||
      postAssessmentScoreBelow !== undefined ||
      isCertified !== undefined ||
      isCertificateSmsSent !== undefined
    )
  }

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (selectedGenders.length > 0) count++
    if (selectedLanguageIds.length > 0) count++
    if (selectedAcademicLevelIds.length > 0) count++
    if (selectedZoneIds.length > 0) count++
    if (ageAbove !== undefined) count++
    if (ageBelow !== undefined) count++
    if (hasConsentForm !== undefined) count++
    if (selectedCohortIds.length > 0) count++
    if (attendancePercentageAbove !== undefined) count++
    if (attendancePercentageBelow !== undefined) count++
    if (hasFilledBaselineSurvey !== undefined) count++
    if (hasFilledEndlineSurvey !== undefined) count++
    if (hasPreAssessmentAttempt !== undefined) count++
    if (hasPostAssessmentAttempt !== undefined) count++
    if (preAssessmentScoreAbove !== undefined) count++
    if (preAssessmentScoreBelow !== undefined) count++
    if (postAssessmentScoreAbove !== undefined) count++
    if (postAssessmentScoreBelow !== undefined) count++
    if (isCertified !== undefined) count++
    if (isCertificateSmsSent !== undefined) count++
    return count
  }

  // Build filters object for API
  const buildFilters = (): StudentFilters => {
    const filters: StudentFilters = {}
    
    if (selectedGenders.length > 0) filters.genders = selectedGenders
    if (selectedLanguageIds.length > 0) filters.languageIds = selectedLanguageIds
    if (selectedAcademicLevelIds.length > 0) filters.academicLevelIds = selectedAcademicLevelIds
    if (selectedZoneIds.length > 0) filters.zoneIds = selectedZoneIds
    if (ageAbove !== undefined) filters.ageAbove = ageAbove
    if (ageBelow !== undefined) filters.ageBelow = ageBelow
    if (hasConsentForm !== undefined) filters.hasConsentForm = hasConsentForm
    if (selectedCohortIds.length > 0) filters.cohortIds = selectedCohortIds
    if (attendancePercentageAbove !== undefined) filters.attendancePercentageAbove = attendancePercentageAbove
    if (attendancePercentageBelow !== undefined) filters.attendancePercentageBelow = attendancePercentageBelow
    if (hasFilledBaselineSurvey !== undefined) filters.hasFilledBaselineSurvey = hasFilledBaselineSurvey
    if (hasFilledEndlineSurvey !== undefined) filters.hasFilledEndlineSurvey = hasFilledEndlineSurvey
    if (hasPreAssessmentAttempt !== undefined) filters.hasPreAssessmentAttempt = hasPreAssessmentAttempt
    if (hasPostAssessmentAttempt !== undefined) filters.hasPostAssessmentAttempt = hasPostAssessmentAttempt
    if (preAssessmentScoreAbove !== undefined) filters.preAssessmentScoreAbove = preAssessmentScoreAbove
    if (preAssessmentScoreBelow !== undefined) filters.preAssessmentScoreBelow = preAssessmentScoreBelow
    if (postAssessmentScoreAbove !== undefined) filters.postAssessmentScoreAbove = postAssessmentScoreAbove
    if (postAssessmentScoreBelow !== undefined) filters.postAssessmentScoreBelow = postAssessmentScoreBelow
    if (isCertified !== undefined) filters.isCertified = isCertified
    if (isCertificateSmsSent !== undefined) filters.isCertificateSmsSent = isCertificateSmsSent
    
    return filters
  }

  // Clear all filters
  const clearAll = () => {
    setSelectedGenders([])
    setSelectedLanguageIds([])
    setSelectedAcademicLevelIds([])
    setSelectedZoneIds([])
    setSelectedCountryId("")
    setSelectedRegionId("")
    setAgeAbove(undefined)
    setAgeBelow(undefined)
    setHasConsentForm(undefined)
    setSelectedCohortIds([])
    setAttendancePercentageAbove(undefined)
    setAttendancePercentageBelow(undefined)
    setHasFilledBaselineSurvey(undefined)
    setHasFilledEndlineSurvey(undefined)
    setHasPreAssessmentAttempt(undefined)
    setHasPostAssessmentAttempt(undefined)
    setPreAssessmentScoreAbove(undefined)
    setPreAssessmentScoreBelow(undefined)
    setPostAssessmentScoreAbove(undefined)
    setPostAssessmentScoreBelow(undefined)
    setIsCertified(undefined)
    setIsCertificateSmsSent(undefined)
  }

  // Handle gender toggle
  const handleGenderToggle = (checked: boolean, gender: string) => {
    setSelectedGenders(prev =>
      checked ? [...prev, gender] : prev.filter(item => item !== gender)
    )
  }

  // Handle location changes with cascading
  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId)
    setSelectedRegionId("")
    setSelectedZoneIds([])
  }

  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId)
    setSelectedZoneIds([])
  }

  return {
    // State values
    selectedGenders,
    selectedLanguageIds,
    selectedAcademicLevelIds,
    selectedZoneIds,
    selectedCountryId,
    selectedRegionId,
    ageAbove,
    ageBelow,
    hasConsentForm,
    selectedCohortIds,
    attendancePercentageAbove,
    attendancePercentageBelow,
    hasFilledBaselineSurvey,
    hasFilledEndlineSurvey,
    hasPreAssessmentAttempt,
    hasPostAssessmentAttempt,
    preAssessmentScoreAbove,
    preAssessmentScoreBelow,
    postAssessmentScoreAbove,
    postAssessmentScoreBelow,
    isCertified,
    isCertificateSmsSent,
    
    // Setters
    setSelectedGenders,
    setSelectedLanguageIds,
    setSelectedAcademicLevelIds,
    setSelectedZoneIds,
    setSelectedCountryId,
    setSelectedRegionId,
    setAgeAbove,
    setAgeBelow,
    setHasConsentForm,
    setSelectedCohortIds,
    setAttendancePercentageAbove,
    setAttendancePercentageBelow,
    setHasFilledBaselineSurvey,
    setHasFilledEndlineSurvey,
    setHasPreAssessmentAttempt,
    setHasPostAssessmentAttempt,
    setPreAssessmentScoreAbove,
    setPreAssessmentScoreBelow,
    setPostAssessmentScoreAbove,
    setPostAssessmentScoreBelow,
    setIsCertified,
    setIsCertificateSmsSent,
    
    // Handlers
    handleGenderToggle,
    handleCountryChange,
    handleRegionChange,
    
    // Utilities
    hasActiveFilters,
    getActiveFilterCount,
    buildFilters,
    clearAll
  }
}

