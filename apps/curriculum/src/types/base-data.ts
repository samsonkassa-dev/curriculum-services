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
| "report-file-type"
| "technological-requirement"
| "technology-integration"
| "training-purpose"
| "work-experience"
| "trainer-requirement"
| "disability"
| "marginalized-group"
| "training-type"
| "training-tag"
| "zone"
| "region";

export const BASE_DATA_CONFIG: Record<BaseDataType, { label: string }> = {
  "academic-level": { label: "Academic Level" },
  "academic-qualification": { label: "Academic Qualification" },
  "age-group": { label: "Age Group" },
  "alignment-standard": { label: "Alignment Standard" },
  "assessment-type": { label: "Assessment Type" },
  "business-type": { label: "Business Type" },
  "city": { label: "City" },
  "country": { label: "Country" },
  "company-file-type": { label: "Company File Type" },
  "delivery-tool": { label: "Delivery Tool" },
  "economic-background": { label: "Economic Background" },
  "education-level": { label: "Education Level" },
  "industry-type": { label: "Industry Type" },
  "instructional-method": { label: "Instructional Method" },
  "language": { label: "Language" },
  "learner-level": { label: "Learner Level" },
  "learner-style-preference": { label: "Learning Style Preference" },
  "learning-resource-type": { label: "Learning Resource Type" },
  "report-file-type": { label: "Report File Type" },
  "technological-requirement": { label: "Technological Requirement" },
  "technology-integration": { label: "Technology Integration" },
  "training-purpose": { label: "Training Purpose" },
  "work-experience": { label: "Work Experience" },
  "trainer-requirement": { label: "Trainer Requirement" },
  "disability": { label: "Disability" },
  "marginalized-group": { label: "Marginalized Group" },
  "training-type": { label: "Training Type" },
  "training-tag": { label: "Training Tag" },
  "zone": { label: "Zone" },
  "region": { label: "Region" }
};