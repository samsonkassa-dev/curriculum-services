export interface BaseDataItem {
  id: string;
  name: string;
  description: string;
}

export type BaseDataType = 
  | "education-level"
  | "academic-level"
  | "learner-style-preference"
  | "language"
  | "training-programs"
  | "differentiation-strategies"
  | "instructional-methods"
  | "technology-integration"
  | "mode-of-delivery"
  | "assessment-type"
  | "assessment-subtype"
  | "technological-requirement"
  | "actor-type"
  | "industry-type"
  | "business-type"; 