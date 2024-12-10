export interface IndividualUser {
  id: string;
  fullName: string;
  email: string;
  status: 'Active' | 'Deactivated';
  createdAt: string;
}

export interface CompanyUser {
  id: string;
  companyName: string;
  businessType: 'Private' | 'Public';
  email: string;
  status: 'Approved' | 'Declined' | 'Pending';
  createdAt: string;
} 