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
  user: ['Home', 'Notifications', 'Self Nominations', 'My Nominations','Add Nomination','Testing','Referral Approval'],
  manager: ['Home', 'Notifications', 'Self Nominations', 'My Nominations', 'Approvals','Add Nomination','Testing','Referral Approval',],
  jury: ['Home', 'Notifications', 'Self Nominations', 'My Nominations','Add Nomination', 'Approvals', 'Business Jury'],
  presidentUnit: ['Home', 'Notifications', 'Self Nominations', 'My Nominations','Add Nomination', 'Approvals', 'President Unit'],
  presidentLevel: ['President Level'],
  admin: 
  ['Home', 'Notifications',
     'Self Nominations','Add Nomination', 
     'My Nominations','Referral Approval', 'Approvals', 
     'Business Jury', 'President Unit', 
     'President Level','Award Management',
     'Admin Setting'],
};
