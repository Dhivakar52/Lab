
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
  email: string | null; 
  mobile: string;
  managerEmail: string;
  contestType: string;
  description: string;
  file: File | null;
}