
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
  files: File[];
  file: File | null;
}

export interface AddNominationState {
 title: string ;
  nomineeName: string ; 
  // department: string;
  // nomineeData:string;
  // entityName: string;
  entityName: number[];
  department: string[];
  nomineeData:string[];
  email: string ; 
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
  CommentsData: any;
}
export type PopupErrors = {
  score: Record<number, string>;
  comment: Record<number, string>;
  comments: string;
  flagComment: string;
  juryFlagComment: string;
  grandFlagComment: string;
};
export type ScoreItem = {
  weightId: number;
  title: string;
  score: number | "";
  comment: string;
};
export const DEFAULT_SCORE_ITEMS: ScoreItem[] = [
  { weightId: 1, title: "Integrity", score: "", comment: "" },
  { weightId: 2, title: "Idea", score: "", comment: "" },
  { weightId: 3, title: "Efforts", score: "", comment: "" },
  { weightId: 4, title: "Outcome", score: "", comment: "" }
];
type StageType = "referral" | "manager" | "jury" | "grand";

export const stageMap: Record<string, StageType> = {
  "referral-approval": "referral",
  "approvals": "manager",
  "business-jury": "jury",
  "president-level": "grand"
};

export interface FileDoc {
  source: "api" | "local";
  originalFileName: string;
  fileNameGUID?: string;
  fileType?: string;
  fileUrl?: string;
  fileSize?: string;
  file?: File;
  AttachmentID?: number;
  isDeleted?: boolean;
}

export interface ApprovalItem {
  ApprovalFlow: string;
  ApprovalType: string;
  ApprovalName: string;
  Status: string;
  ApprovalComments: string;
  ApprovedAt: string;
  ApprovalScore: number;
  Flagdetails?: string;
  EvaluatedJuries?: number;
  TotalEvalutions?: number;
  TotalFlagCount?: number;
  JuryMember?: string;
}
