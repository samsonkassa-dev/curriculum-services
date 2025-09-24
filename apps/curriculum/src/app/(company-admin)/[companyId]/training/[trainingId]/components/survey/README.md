# Survey Component System

## Overview

The Survey Component System provides a comprehensive solution for creating, managing, and editing surveys within training programs. It supports multiple question types, follow-up questions, image uploads, and real-time validation.

## Key Features

### 🔄 Follow-up Questions
- Questions can have follow-up questions based on specific choices from parent questions
- Follow-ups are triggered by selecting a specific choice (A, B, C, etc.) from a parent question
- **Constraints:**
  - First question in any section cannot be a follow-up question
  - GRID type questions cannot have follow-up questions (but can BE follow-up questions)
  - Follow-up questions can be of any type: RADIO, CHECKBOX, TEXT, or GRID

### 🔢 Question Numbering
- Each question gets a unique `questionNumber` starting from 1
- Used to identify parent-child relationships for follow-up questions
- Automatically assigned during form submission

### 🖼️ Image Support
- **Question Images**: Upload images for questions themselves
- **Choice Images**: Upload images for individual answer choices
- **Smart Validation**: When a choice has an image, text is optional for that choice
- **File Formats**: Supports PNG, JPG, JPEG, GIF, WebP
- **Multipart Upload**: Files are sent as multipart form data alongside JSON payload

### 📝 Question Types
- **RADIO**: Single choice selection
- **CHECKBOX**: Multiple choice selection  
- **TEXT**: Free text input with optional text area
- **GRID**: Matrix-style questions (cannot have follow-ups, but can be follow-ups)

## Architecture

### Component Structure
```
survey/
├── survey.tsx                    # Main orchestrator component
├── CreateSurveyForm.tsx          # Form container and state management
├── components/
│   ├── SingleQuestionEditor.tsx  # Individual question editing
│   ├── QuestionPreviews.tsx      # Real-time question preview
│   └── SurveyNavigation.tsx      # Section/question navigation
└── README.md                     # This file
```

### Data Flow
```
survey.tsx
    ↓ (manages view modes)
CreateSurveyForm.tsx
    ↓ (manages sections/questions state)
SingleQuestionEditor.tsx
    ↓ (handles individual question editing)
useSurvey.ts (API calls)
```

## Data Types

### Core Interfaces

```typescript
interface CreateSurveyChoice {
  choice: string;                // Choice text (optional if image provided)
  choiceImage?: string;         // Image URL (from server)
  choiceImageFile?: File;       // Local file for upload
}

interface CreateSurveyEntry {
  question: string;             // Question text
  questionImage?: string;       // Question image URL (from server)
  questionImageFile?: File;     // Local file for upload
  questionType: QuestionType;   // RADIO, CHECKBOX, TEXT, GRID
  choices: CreateSurveyChoice[]; // Answer choices
  allowTextAnswer: boolean;     // Allow "Other" text input
  rows: string[];              // For GRID type questions
  required: boolean;           // Is question mandatory
  questionNumber?: string;     // Auto-assigned unique number
  parentQuestionNumber?: number; // Parent question for follow-ups
  parentChoice?: string;       // Parent choice (A, B, C, etc.)
  followUp?: boolean;          // Is this a follow-up question
}
```

## API Integration

### Multipart Form Data Structure
The system sends data as multipart form data with:

1. **JSON Payload** (key: `'payload'`):
   ```json
   {
     "name": "Survey Name",
     "type": "BASELINE",
     "description": "Survey description",
     "sections": [
       {
         "title": "Section Title",
         "surveyEntries": [
           {
             "question": "Question text",
             "questionNumber": "1",
             "questionType": "RADIO",
             "choices": [{"choice": "Choice A"}, {"choice": "Choice B"}],
             "required": true,
             "followUp": false
           }
         ]
       }
     ]
   }
   ```

2. **File Uploads** (indexed keys):
   - Question images: `sections[0].surveyEntries[0].questionImage`
   - Choice images: `sections[0].surveyEntries[0].choices[0].choiceImage`

### API Endpoints
- **Create Survey**: `POST /survey/training/{trainingId}`
- **Add Question**: `POST /survey-entry/survey-section/{sectionId}`
- **Update Question**: `PUT /survey-entry/{entryId}`

## Usage Examples

### Creating a Basic Survey
```typescript
const surveyData: CreateSurveyData = {
  name: "Customer Feedback",
  type: "BASELINE",
  description: "Post-training survey",
  sections: [
    {
      title: "General Questions",
      surveyEntries: [
        {
          question: "How satisfied are you?",
          questionType: "RADIO",
          choices: [
            { choice: "Very Satisfied" },
            { choice: "Satisfied" },
            { choice: "Neutral" }
          ],
          required: true,
          followUp: false
        }
      ]
    }
  ]
}
```

### Creating Follow-up Questions
```typescript
// Parent question (questionNumber: 1)
{
  question: "Did you enjoy the training?",
  questionType: "RADIO",
  choices: [
    { choice: "Yes" },     // Choice A
    { choice: "No" }       // Choice B
  ],
  questionNumber: "1",
  followUp: false
}

// Follow-up question (triggers on "No" - Choice B)
{
  question: "What could we improve?",
  questionType: "TEXT",
  parentQuestionNumber: 1,
  parentChoice: "B",
  questionNumber: "2",
  followUp: true
}
```

### Adding Images
```typescript
// Question with image
{
  question: "Identify this logo:",
  questionImageFile: logoFile, // File object from upload
  questionType: "RADIO",
  choices: [
    { choice: "Company A", choiceImageFile: logoA },
    { choice: "Company B", choiceImageFile: logoB },
    { choice: "", choiceImageFile: logoC } // Text optional when image provided
  ]
}
```

## Validation Rules

### Form Validation
- Survey name is required
- Each section must have a title
- Questions must have text or image
- Choices must have text or image (at least one)
- First question in section cannot be follow-up
- GRID questions cannot have follow-ups (but can be follow-ups themselves)

### Follow-up Validation
- `parentQuestionNumber` must reference existing question
- `parentChoice` must be valid (A, B, C, etc.)
- Parent question can be any type (RADIO, CHECKBOX, TEXT, or GRID)
- However, GRID questions themselves cannot have follow-ups

## State Management

### Local State (CreateSurveyForm)
```typescript
const [sections, setSections] = useState<CreateSurveySection[]>([])
const [selectedSection, setSelectedSection] = useState(0)
const [selectedQuestion, setSelectedQuestion] = useState(0)
```

### File Handling
- Files stored in component state as `File` objects
- Preserved through question type changes
- Sent as multipart data during submission
- Preview functionality using `URL.createObjectURL`

## Performance Considerations

### Optimizations
- Lazy loading of question previews
- Debounced validation
- Memoized form calculations
- Efficient state updates using spread operators

### File Management
- Local file previews to avoid re-uploads
- Automatic cleanup of object URLs
- File size validation (recommended: < 5MB per image)

## Error Handling

### Common Issues
1. **400 Bad Request**: Usually multipart form data structure issues
2. **File Upload Failures**: Check file format and size limits
3. **Validation Errors**: Ensure all required fields are populated
4. **Follow-up Logic**: Verify parent question relationships

### Debugging
- Network tab shows multipart payload structure
- Console errors indicate validation failures
- Form state can be inspected via React DevTools

## Future Enhancements

### Planned Features
- Drag-and-drop question reordering
- Question templates and presets
- Conditional logic beyond simple follow-ups
- Rich text editor for questions
- Video/audio question support
- Export/import survey definitions

### Technical Debt
- Consider moving to React Hook Form for better performance
- Implement proper TypeScript strict mode
- Add comprehensive unit tests
- Optimize bundle size with code splitting

## Browser Compatibility
- Modern browsers with File API support
- FormData multipart upload capability
- ES6+ JavaScript features required

## Security Considerations
- File upload validation on both client and server
- CSRF protection for form submissions
- Proper authentication headers
- Input sanitization for text fields
