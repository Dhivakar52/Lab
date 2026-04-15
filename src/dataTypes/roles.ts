export const USER_ROLES = {
  USER: 'user',
  MANAGER: 'manager',
  JURY: 'jury',
  PRESIDENT_UNIT: 'presidentUnit',
  PRESIDENT_LEVEL: 'presidentLevel',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];


export const ROLE_PAGES: Record<UserRole, string[]> = {
  user: ['Home', 'Notifications', 'Self Nominations','Other Nomination', 'My Nominations','Add Nomination','Testing','Grand Jury','Primary Business Jury','Leader Board','Referral Approval','Category Wise Nomination'],
  manager: ['Home', 'Notifications', 'Self Nominations','Other Nomination', 'My Nominations', 'Approvals','Add Nomination','Testing', 'Grand Jury','Primary Business Jury','Leader Board','Referral Approval','Category Wise Nomination'],
  jury: ['Home', 'Notifications', 'Self Nominations', 'Other Nomination','My Nominations','Add Nomination', 'Approvals', 'Business Jury', 'Grand Jury','Primary Business Jury','Leader Board','Category Wise Nomination'],
  presidentUnit: ['Home', 'Notifications', 'Self Nominations','Other Nomination', 'My Nominations','Add Nomination', 'Approvals', 'President Unit', 'Grand Jury','Primary Business Jury','Leader Board','Category Wise Nomination'],
  presidentLevel: ['President Level','Grand Jury','Leader Board','Category Wise Nomination'],
  admin: 
  ['Home', 'Notifications',
     'Self Nominations','Other Nomination','Add Nomination', 
     'My Nominations','Referral Approval', 'Approvals', 
     'Business Jury', 'President Unit', 
     'President Level','Award Management',
     'Grand Jury','Primary Business Jury','Leader Board',
     'Admin Setting','Category Wise Nomination'],
};

