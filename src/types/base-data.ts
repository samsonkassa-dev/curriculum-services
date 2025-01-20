export interface BaseDataItem {
  id: string;
  name: string;
  description: string;
}

export type BaseDataType = 
| "academic-level"
| "academic-qualification"
| "age-group"
| "assessment-type"
| "business-type"
| "city"
| "country"
| "company-file-type"
| "delivery-tool"
| "economic-background"
| "education-level"
| "industry-type"
| "instructional-method"
| "language"
| "learner-level"
| "learner-style-preference"
| "learning-resource-type"
| "technological-requirement"
| "technology-integration"
| "training-purpose"
| "work-experience"
| "trainer-requirement"
