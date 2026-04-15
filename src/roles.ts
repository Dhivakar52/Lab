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
  user: ['Home', 'Notifications', 'Self Nominations','Other Nomination', 'My Nominations','Add Nomination','Testing','Referral Approval','Report'],
  manager: ['Home', 'Notifications', 'Self Nominations','Other Nomination', 'My Nominations', 'Approvals','Add Nomination','Testing', 'Referral Approval','Report'],
  jury: ['Home', 'Notifications', 'Self Nominations', 'Other Nomination','My Nominations','Add Nomination', 'Approvals', 'Business Jury','Report'],
  presidentUnit: ['Home', 'Notifications', 'Self Nominations','Other Nomination', 'My Nominations','Add Nomination', 'Approvals', 'President Unit','Report'],
  presidentLevel: ['President Level'],
  admin: 
  ['Home', 'Notifications',
     'Self Nominations','Other Nomination','Add Nomination', 
     'My Nominations','Referral Approval', 'Approvals', 
     'Business Jury', 'President Unit', 
     'President Level','Award Management',
     'Leader Board','Admin Setting','Report'],
};
