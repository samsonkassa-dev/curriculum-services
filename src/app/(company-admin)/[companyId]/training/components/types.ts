/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StepProps {
  onNext: (data: any) => void;
  onBack?: () => void;
} 