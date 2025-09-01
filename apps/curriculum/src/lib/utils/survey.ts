import type { CreateSurveyEntry, QuestionType, SurveyEntry } from "@/lib/hooks/useSurvey";

// Utility: defaults for creating survey entries by type
export const getDefaultQuestionFields = (
  questionType: QuestionType
): Partial<CreateSurveyEntry> => {
  switch (questionType) {
    case "TEXT":
      return {
        choices: [],
        allowTextAnswer: true,
        rows: [],
      };
    case "RADIO":
      return {
        choices: [{ choice: "" }, { choice: "" }],
        allowTextAnswer: false,
        rows: [],
      };
    case "CHECKBOX":
      return {
        choices: [{ choice: "" }, { choice: "" }],
        allowTextAnswer: false,
        rows: [],
      };
    case "GRID":
      return {
        choices: [{ choice: "" }, { choice: "" }],
        allowTextAnswer: false,
        rows: ["", ""],
      };
    default:
      return {
        choices: [],
        allowTextAnswer: false,
        rows: [],
      };
  }
};

// Utility: defaults for adding a single question into a survey section
export const getDefaultAddQuestionFields = (
  questionType: QuestionType
): Partial<CreateSurveyEntry> => {
  switch (questionType) {
    case "TEXT":
      return {
        choices: [],
        allowTextAnswer: true,
        rows: [],
      };
    case "RADIO":
      return {
        choices: [{ choice: "" }, { choice: "" }],
        allowTextAnswer: false,
        rows: [],
      };
    case "CHECKBOX":
      return {
        choices: [{ choice: "" }, { choice: "" }],
        allowTextAnswer: false,
        rows: [],
      };
    case "GRID":
      return {
        choices: [{ choice: "" }, { choice: "" }],
        allowTextAnswer: false,
        rows: ["", ""],
      };
    default:
      return {
        choices: [],
        allowTextAnswer: false,
        rows: [],
      };
  }
};

export const validateSurveyEntry = (
  entry: SurveyEntry
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!entry.question.trim()) {
    errors.push("Question text is required");
  }

  switch (entry.questionType) {
    case "TEXT":
      break;
    case "RADIO":
    case "CHECKBOX":
      if (entry.choices.length < 2) {
        errors.push("At least 2 choices are required");
      }
      if (entry.choices.some((choice) => {
        const text = typeof choice === 'string' ? choice : choice.choiceText;
        return !text?.trim();
      })) {
        errors.push("All choices must have text");
      }
      break;
    case "GRID":
      if (entry.choices.length < 2) {
        errors.push("At least 2 column choices are required for grid questions");
      }
      if (entry.rows.length < 2) {
        errors.push("At least 2 rows are required for grid questions");
      }
      if (entry.choices.some((choice) => {
        const text = typeof choice === 'string' ? choice : choice.choiceText;
        return !text?.trim();
      })) {
        errors.push("All column choices must have text");
      }
      if (entry.rows.some((row) => !row.trim())) {
        errors.push("All row options must have text");
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validation for creation form entry
export const validateCreateSurveyEntry = (
  entry: CreateSurveyEntry
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!entry.question.trim()) {
    errors.push("Question text is required");
  }

  switch (entry.questionType) {
    case "TEXT":
      break;
    case "RADIO":
    case "CHECKBOX":
      if (entry.choices.length < 2) {
        errors.push("At least 2 choices are required");
      }
      if (entry.choices.some((choice) => !choice?.choice?.trim() && !choice?.choiceImage && !choice?.choiceImageFile)) {
        errors.push("All choices must have text or image");
      }
      break;
    case "GRID":
      if (entry.choices.length < 2) {
        errors.push("At least 2 column choices are required for grid questions");
      }
      if (entry.rows.length < 2) {
        errors.push("At least 2 rows are required for grid questions");
      }
      if (entry.choices.some((choice) => !choice?.choice?.trim() && !choice?.choiceImage && !choice?.choiceImageFile)) {
        errors.push("All column choices must have text or image");
      }
      if (entry.rows.some((row) => !row.trim())) {
        errors.push("All row options must have text");
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


