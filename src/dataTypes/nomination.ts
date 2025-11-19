
 export default interface Nomination {
  id: string;
  nominee: string;
  entity: string;
  category: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  progress: string;
}


export interface FormState {
 title: string;
  nomineeName: string | null; 
  department: string;
  nomineeData:string;
  email: string | null; 
  mobile: string;
  managerEmail: string;
  contestType: string;
  description: string;
  file: File | null;
}

export interface AddNominationState {
 title: string;
  nomineeName: string | null; 
  department: string | null;
  nomineeData:string;
  email: string | null; 
  entityName: string;
  mobile: string;
  managerEmail: string;
  contestType: string;
  description: string;
  file: File | null;
}

export interface Feed {
  UserID: number;
  LikedBy: any;
  Nominee: string;
  NominationID: number;
  Tenant: string;
  AwardCategory: string;
  NominatedCount: number;
  Description: string;
  Likes: number;
  Comments: number;
  Views: number;
}