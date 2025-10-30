# Base Data Localization Feature Implementation

## Overview
This implementation adds localization support for specific base data types in the curriculum services application. The feature allows adding alternate language names for base data items, making the system more accessible for multilingual users.

## Supported Base Data Types
The following base data types now support localization:
- Zone
- Region  
- Language
- Marginalized Group
- Disability
- Academic Level

## API Endpoints Used
For each supported type, the system uses dedicated endpoints:
- `/api/zone/add-other-language-name`
- `/api/region/add-other-language-name`
- `/api/language/add-other-language-name`
- `/api/marginalized-group/add-other-language-name`
- `/api/disability/add-other-language-name`
- `/api/academic-level/add-other-language-name`

## Key Features

### 1. Type Safety
- Updated `BaseDataItem` interface to include `alternateNames` property
- Added `LOCALIZABLE_TYPES` constant for type checking
- Added `AlternateLanguageName` interface for structured language data

### 2. UI Components
- **Add Alternate Name Dialog**: Allows users to add translations in different languages
- **Language Selection**: Dropdown with common Ethiopian languages (Amharic, Oromo, Tigrinya, etc.)
- **Alternate Names Display**: Shows existing translations as badges with language codes

### 3. Data Display
- Alternate names are displayed as colored badges showing "lang_code: name"
- Only shows for supported base data types
- Displays "-" when no alternate names exist

### 4. User Experience
- Language selection prevents duplicate entries
- Shows which languages already have translations
- Intuitive UI with clear visual feedback
- Loading states for all operations

## How to Use

### Adding Alternate Language Names
1. Navigate to Base Data management
2. Select a supported base data type (zone, region, etc.)
3. Find the item you want to localize
4. Click the "Add Language" button (Languages icon) in the actions column
5. Select a language from the dropdown
6. Enter the alternate name in that language
7. Click "Add" to save

### Viewing Alternate Names
- Alternate names are displayed in the "Alternate Names" column
- Each name shows as a badge with format: "language_code: alternate_name"
- Example: "am: ሰሜን ወሎ ዞን" for Amharic translation

## Technical Implementation

### Files Modified/Created
1. `src/types/base-data.ts` - Added localization types and constants
2. `src/lib/hooks/useBaseData.ts` - Added localization mutation
3. `src/app/(icog-admin)/basedata/columns.tsx` - Added alternate names column
4. `src/app/(icog-admin)/basedata/components/action-cell.tsx` - Added localization button
5. `src/app/(icog-admin)/basedata/components/add-alternate-name-dialog.tsx` - New component

### Supported Languages
- Amharic (am)
- Oromo (om)  
- Tigrinya (ti)
- Somali (so)
- Afar (aa)
- Sidamo (sid)
- Wolaytta (wo)
- Ge'ez (gez)
- Gurage (gu)
- Harari (har)
- English (en)

## API Request Structure
The API expects an array of language objects:
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "languageCode": "am",
    "otherLanguageName": "ሰሜን ወሎ ዞን"
  }
]
```

## Data Display Structure
Items with alternate names are displayed with the following structure:
```json
{
  "id": "5044c830-f4e1-4c33-b2c7-22948d7ab91c",
  "name": "North Wollo Zone",
  "description": "---",
  "alternateNames": {
    "am": "ሰሜን ወሎ ዞን",
    "en": "North Wollo Zone",
    "om": "Godina Walloo Kaabaa"
  }
}
```

## Benefits
1. **Multilingual Support**: Makes the application accessible to users speaking different Ethiopian languages
2. **Consistent UX**: Maintains the same interface patterns as other base data operations
3. **Type Safety**: Full TypeScript support prevents runtime errors
4. **Extensible**: Easy to add more languages or base data types in the future
5. **Performance**: Optimized queries and caching for fast data retrieval
