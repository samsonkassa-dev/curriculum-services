# Survey System Documentation

## Overview

The Survey System is a comprehensive solution for creating, managing, and administering surveys within the training platform. It supports various question types, section-based organization, and both baseline and endline survey types.

## Component Architecture

### Refactored Structure

The main `CreateSurveyForm.tsx` has been broken down into smaller, manageable components:

```
survey/
├── components/
│   ├── SurveySettings.tsx          # Survey basic information form
│   ├── SurveyNavigation.tsx        # Left sidebar navigation
│   ├── QuestionPreviews.tsx        # Question preview components  
│   └── SingleQuestionEditor.tsx    # Question editing interface
├── CreateSurveyForm.tsx            # Main survey builder (now ~400 lines)
├── ViewSurveyDetails.tsx           # Survey viewing interface
├── SurveyList.tsx                  # Survey list with cards
└── survey.tsx                      # Main survey component router
```

### Component Responsibilities

#### SurveySettings.tsx
- Survey name, type, and description forms
- Handles read-only mode for edit scenarios
- Clean, focused UI for survey metadata

#### SurveyNavigation.tsx
- Left sidebar with section/question navigation
- Section title editing (with read-only logic)
- Add/delete buttons for sections and questions
- Visual indicators for selected items

#### QuestionPreviews.tsx
- Preview components for all question types (TEXT, RADIO, CHECKBOX, GRID)
- Live preview of how questions will appear to trainees
- Handles complex layouts like grid tables

#### SingleQuestionEditor.tsx
- Question text editing
- Question type selection with visual icons
- Dynamic form fields based on question type
- Choice/row management for complex question types

## Key Features

### 1. Smart Edit Mode
- **Read-only Survey Metadata**: Can't change survey name/type/description in edit mode
- **Selective Section Editing**: Can only edit titles of newly added sections
- **Flexible Question Management**: Add/edit/delete questions in any section
- **Change Detection**: Tracks what's new vs existing for efficient API calls

### 2. Multi-Section Question Adding
- Add questions to multiple sections in one editing session
- Batch API calls for all changes when saving
- Smart detection of new vs existing content

### 3. Question Types Support
  - **TEXT**: Simple text input
- **RADIO**: Single choice with configurable options
- **CHECKBOX**: Multiple choice with configurable options  
- **GRID**: Matrix questions with rows and columns

### 4. Real-time Validation
- Client-side validation during form filling
- Comprehensive pre-submit validation
- Clear error messages with context

## API Integration

### React Query Hooks

The system provides comprehensive React Query hooks for all API operations:

#### Survey Management Hooks
```typescript
// Survey CRUD operations
useSurveys(trainingId)           // GET /api/survey/training/{trainingId}
useCreateSurvey(trainingId)      // POST /api/survey/training/{trainingId}
useSurveyDetail(surveyId)        // GET /api/survey/{surveyId}
useUpdateSurvey()                // PUT /api/survey/{surveyId}
useDeleteSurvey()                // DELETE /api/survey/{surveyId}
```

#### Section Management Hooks
```typescript
// Section operations
useSurveySections(surveyId)      // GET /api/survey-section/survey/{surveyId}
useAddSectionToSurvey()          // POST /api/survey-section/survey/{surveyId}
useUpdateSurveySection()         // PUT /api/survey-section/{sectionId} - NEW
useDeleteSurveySection()         // DELETE /api/survey-section/{sectionId}
```

#### Question Management Hooks
```typescript
// Question operations
useAddQuestionToSection()        // POST /api/survey-entry/survey-section/{sectionId}
useUpdateSurveyEntry()           // PATCH /api/survey-entry/{questionId}
useDeleteSurveyEntry()           // DELETE /api/survey-entry/{questionId}
```

### Different Data Structures

The system uses different TypeScript interfaces for different API operations:

#### GET Operations (Viewing)
```typescript
interface SurveyEntry {
  id?: string
  question: string
  questionType: QuestionType
  choices: string[]
  allowMultipleAnswers: boolean  // For checkbox questions
  allowOtherAnswer: boolean      // For "Other" option
  rows: string[]                 // For grid questions
  required: boolean
}

interface SurveySection {
  id: string
  title: string
  questions: SurveyEntry[]       // Uses "questions" field
}
```

#### POST Operations (Creating)
```typescript  
interface CreateSurveyEntry {
  question: string
  questionType: QuestionType
  choices: string[]
  allowTextAnswer: boolean       // Different field name for creation
  rows: string[]
  required: boolean
}

interface CreateSurveySection {
  title: string
  surveyEntries: CreateSurveyEntry[]  // Uses "surveyEntries" field
}
```

#### PATCH Operations (Updating Questions)
```typescript
interface UpdateSurveyEntryData {
  question: string
  questionType: QuestionType
  choices: string[]
  allowOtherAnswer: boolean      // Back to "allowOtherAnswer"
  rows: string[]
  isRequired: boolean           // Different field name: "isRequired"
}
```

#### Special Operations
```typescript
// Adding questions to existing sections
interface AddSurveyEntryData {
  question: string
  questionType: QuestionType
  choices: string[]
  allowTextAnswer: boolean      // Uses creation format
  rows: string[]
  required: boolean
}

// Section title updates
interface UpdateSectionData {
  title: string                 // Simple title update only
}
```

### API Endpoints

#### Survey Management
- `GET /api/survey/training/{trainingId}` - List surveys for training
- `POST /api/survey/training/{trainingId}` - Create new survey
- `GET /api/survey/{surveyId}` - Get survey details with sections
- `PUT /api/survey/{surveyId}` - Update survey metadata
- `DELETE /api/survey/{surveyId}` - Delete survey

#### Section Management
- `GET /api/survey-section/survey/{surveyId}` - Get sections for editing
- `POST /api/survey-section/survey/{surveyId}` - Add new section
- `PUT /api/survey-section/{sectionId}` - Update section title **NEW**
- `DELETE /api/survey-section/{sectionId}` - Delete section **NEW**

#### Question Management
- `POST /api/survey-entry/survey-section/{sectionId}` - Add question to section
- `PATCH /api/survey-entry/{questionId}` - Update existing question
- `DELETE /api/survey-entry/{questionId}` - Delete question

### Smart API Strategy
- **Change Detection**: Only calls APIs for actual changes vs original state
- **Batch Operations**: Multiple changes handled efficiently
- **Optimistic Updates**: Immediate UI feedback with rollback on failure
- **Cache Management**: Proper invalidation strategies with React Query

## Usage Flow

### Creating New Survey
1. User clicks "Create New Survey"
2. Opens survey builder in create mode
3. User builds survey structure
4. Single API call creates entire survey
5. Returns to survey list

### Editing Existing Survey
1. User clicks "Add Question" on specific section
2. Opens builder with existing sections loaded
3. Focuses on target section with new question
4. User makes changes across multiple sections
5. Batch saves all changes via appropriate APIs
6. Returns to survey view

### Deleting Content
- **Existing questions/sections**: API delete calls
- **New questions/sections**: Local state removal only

## Error Handling & Validation

### Client-Side Validation
```typescript
// Form validation before submission
const validateForm = () => {
  if (!surveyName.trim()) {
    toast.error("Survey name is required")
    return false
  }
  // ... comprehensive validation
}

// Question validation
const validateCreateSurveyEntry = (question: CreateSurveyEntry) => {
  const errors: string[] = []
  if (!question.question.trim()) {
    errors.push("Question text is required")
  }
  // ... field-specific validation
  return { isValid: errors.length === 0, errors }
}
```

### API Error Handling
- **Toast Notifications**: User-friendly error messages
- **Loading States**: Visual feedback during operations
- **Optimistic Updates**: Immediate UI changes with rollback
- **Retry Logic**: Automatic retry on network failures
- **Graceful Degradation**: Fallback UI states

## Benefits of Refactoring

### Code Maintainability
- **Single Responsibility**: Each component has one clear purpose
- **Reduced Complexity**: Main form is now ~400 lines vs 1100+
- **Better Testing**: Smaller components are easier to test
- **Reusability**: Components can be reused in other contexts

### Developer Experience
- **Easier Navigation**: Find specific functionality quickly
- **Cleaner Imports**: Logical component organization
- **Better IDE Support**: Smaller files load and analyze faster
- **Collaborative Development**: Multiple developers can work on different components

### Performance
- **Bundle Splitting**: Components can be lazy-loaded
- **Better Caching**: Smaller components cache more effectively
- **Optimized Re-renders**: Isolated state reduces unnecessary renders

## Recent Improvements

### UI/UX Enhancements
- **Smaller Icons**: Reduced pencil edit icon size for better proportions
- **Accordion Interface**: Collapsible sections with chevron indicators
- **Improved Button Layout**: Consistent sizing and spacing
- **Delete Confirmation**: Proper dialog with warning message
- **Responsive Design**: Better layout on different screen sizes

### Technical Improvements
- **TypeScript Safety**: Fixed all section.id undefined issues
- **Proper Hook Integration**: Added `useUpdateSurveySection` hook
- **Enhanced Error Handling**: Better error messages and states
- **API Consistency**: Proper mapping between different data structures
- **Build Optimization**: All TypeScript errors resolved

## Future Enhancements

### Planned Features
- **Question Reordering**: Drag and drop functionality
- **Question Templates**: Pre-built question library
- **Advanced Validation**: Custom validation rules
- **Survey Analytics**: Response tracking and reporting
- **Mobile Optimization**: Enhanced mobile experience
- **Bulk Operations**: Select and manage multiple questions/sections
- **Survey Duplication**: Copy existing surveys with modifications

### Technical Roadmap
- **Performance**: Further optimization for large surveys
- **Accessibility**: Enhanced keyboard navigation and screen reader support
- **Testing**: Comprehensive unit and integration test coverage
- **Documentation**: Interactive examples and API documentation
- **Monitoring**: Error tracking and performance analytics