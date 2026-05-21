export const USER_ROLES = {
  // USER: 'user',
  // MANAGER: 'manager',
  // JURY: 'jury',
  // PRESIDENT_UNIT: 'presidentUnit',
  // PRESIDENT_LEVEL: 'presidentLevel',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];


export const ROLE_PAGES: Record<UserRole, string[]> = {
  // user: ['Home', 'Notifications', 'Self Nominations','Other Nomination', 'My Nominations','Add Nomination','Referral Approval','Grand Jury','Primary Business Jury','Leader Board'],
  // manager: ['Home', 'Notifications', 'Self Nominations','Other Nomination', 'My Nominations', 'Approvals','Add Nomination','Referral Approval', 'Grand Jury','Primary Business Jury','Leader Board'],
  // jury: ['Home', 'Notifications', 'Self Nominations', 'Other Nomination','My Nominations','Add Nomination','Referral Approval', 'Approvals', 'Business Jury', 'Grand Jury','Primary Business Jury','Leader Board'],
  // presidentUnit: ['Home', 'Notifications', 'Self Nominations','Other Nomination', 'My Nominations','Add Nomination','Referral Approval', 'Approvals', 'President Unit', 'Grand Jury','Primary Business Jury','Leader Board'],
  // presidentLevel: ['President Level','Grand Jury','Leader Board'],
  // admin: 
  // ['Dashboard','Home', 'Notifications',
  //    'Self Nominations','Other Nomination','Add Nomination', 
  //    'My Nominations','Referral Approval', 'Approvals', 
  //    'Business Jury', 'President Unit', 
  //    'President Level','Award Management',
  //    'Grand Jury','Primary Business Jury','Leader Board',
  //    'Admin Setting','Category Wise Nomination'],
      admin: 
  ['Dashboard','Home','Study','StudyMasterStepper','SiteModule','AmendmentModule','Subject','Enrollment','Adverse','Visit', 'Admin'],
};

