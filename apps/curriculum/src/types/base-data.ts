export interface BaseDataItem {
  id: string;
  name: string;
  description: string;
}

export interface BaseDataOptions {
  type?: 'INSTRUCTOR' | 'LEARNER';
  subType?: 'FORMATIVE' | 'SUMMATIVE' | 'OTHER';
  enabled?: boolean;
}

export type BaseDataType =
| "academic-level"
| "academic-qualification"
| "age-group"
| "alignment-standard"
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
| "assessment-type"
| "disability"
| "marginalized-group"
| "training-type"
| "training-tag"
| "report-file-type"