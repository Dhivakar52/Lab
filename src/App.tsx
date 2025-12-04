// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationPage';
import SelfNominationPage from './pages/SelfNominationPage';
import NominationPage from './pages/NominationPage';
import AddNomination from './components/NominationContent/AddNomination';
import ApprovalComponent from './components/ManagerPage/ApprovalComponent';
import BusinessJury from './components/Jury/BusinessJury';
import PresidentLevel from './components/PresidentLevel/PresidentLevel';
import PresidentUnit from './components/PresidentUnitLevel/PresidentUnit';
import AdminInner from './components/AdminSetting/AdminInner';
import AwardCategories from './components/AdminSetting/AwardCategories';
import EntitiesDepartments from './components/AdminSetting/EntitiesDepartments';
import JuryEvaluationConfiguration from './components/AdminSetting/JuryEvaluationConfiguration';
import JuryRoleMapping from './components/AdminSetting/JuryRoleMapping';
import RoleAccessLevels from './components/AdminSetting/RoleAccessLevels';
import NominationCycleMaster from './components/AdminSetting/NominationCycleMaster';
import JuryPanelSetup from './components/AdminSetting/JuryPanelSetup';
import AwardManagement from './components/Award/AwardManagement';
import Login from './pages/auth/Login/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import type { UserRole } from './dataTypes/roles';
import { ROLE_PAGES } from './dataTypes/roles';
import { AuthProvider } from './components/ContextAPI/AuthContext.tsx';
import Testing from './components/Testing/Testing.tsx';
import ForgotPassword from './pages/auth/Login/ForgotPassword.tsx';
import ReferralComponent from './components/ReferralApproval/ReferralComponent.tsx';


import VerifyOtp from './pages/auth/Login/VerifyOtp';
import ResetPassword from './pages/auth/Login/ResetPassword';

// -------------------------
// Main page components
// -------------------------
const pageComponents: Record<string, React.ReactNode> = {
  'Home': <HomePage />,
  'Notifications': <NotificationsPage />,
  'Self Nominations': <SelfNominationPage />,
  'My Nominations': <NominationPage />,
  'Approvals': <ApprovalComponent />,
  'Business Jury': <BusinessJury />,
  'President Unit': <PresidentUnit />,
  'President Level': <PresidentLevel />,
  'Award Management': <AwardManagement />,
  'Admin Setting': <AdminInner />,
   'Forgot Password': <ForgotPassword/>,
  'Testing': <Testing />,
  'Referral Approval': <ReferralComponent />,
};

// -------------------------
// Admin sub-pages
// -------------------------
const adminSubPages: Record<string, React.ReactNode> = {
  'award-categories': <AwardCategories />,
  'entities-departments': <EntitiesDepartments />,
  'nomination-cycle': <NominationCycleMaster />,
  'jury-panel-setup': <JuryPanelSetup />,
  'jury-evaluation-settings': <JuryEvaluationConfiguration />,
  'jury-role-mapping': <JuryRoleMapping />,
  'role-list': <RoleAccessLevels />,
};

// -------------------------
// Allowed roles for admin sub-pages
// -------------------------
const adminSubPageRoles: Record<string, UserRole[]> = {
  'award-categories': ['admin'],
  'entities-departments': ['admin'],
  'nomination-cycle': ['admin'],
  'jury-panel-setup': ['admin'],
  'jury-evaluation-settings': ['admin'],
  'jury-role-mapping': ['admin'],
  'role-list': ['admin'],
};

// -------------------------
// Get allowed roles for main pages
// -------------------------
const getAllowedRoles = (pageLabel: string): UserRole[] => {
  const matches = Object.entries(ROLE_PAGES)
    .filter(([_, pages]) => pages.includes(pageLabel))
    .map(([role]) => role as UserRole);

  if (matches.length === 0) {
    return Object.keys(ROLE_PAGES) as UserRole[];
  }
  return matches;
};

// -------------------------
// App Component
// -------------------------
const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null | undefined>(undefined);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as UserRole | null;
    setUserRole(storedRole);
  }, []);

  if (userRole === undefined) return null; // wait for role

  return (
    <AuthProvider>
  
  <Router>
   <Routes>
     {/* Public login route */}
     <Route path="/" element={<Login setUserRole={setUserRole} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

     {/* Protected routes */}
     <Route element={<Layout />}>
       {/* Main pages */}
       {Object.entries(pageComponents).map(([label, component]) => {
         const path = '/' + label.toLowerCase().replace(/\s+/g, '-');
         const allowedRoles = getAllowedRoles(label);

         return (
           <Route
             key={label}
             path={path}
             element={
               <ProtectedRoute userRole={userRole} allowedRoles={allowedRoles}>
                 {component}
               </ProtectedRoute>
             }
           />
         );
       })}

       {/* Admin sub-pages */}
       {Object.entries(adminSubPages).map(([slug, component]) => (
         <Route
           key={slug}
           path={`/admin-setting/${slug}`}
           element={
             <ProtectedRoute
               userRole={userRole}
               allowedRoles={adminSubPageRoles[slug]}
             >
               {component}
             </ProtectedRoute>
           }
         />
       ))}

       {/* Add Nomination nested route */}
       <Route
         path="/my-nominations/add-nomination"
         element={
           <ProtectedRoute
             userRole={userRole}
             allowedRoles={getAllowedRoles('Add Nomination')}
           >
             <AddNomination />
           </ProtectedRoute>
         }
       />

       {/* Fallback */}
        <Route path="/forgot" element={<ForgotPassword/>} />
       <Route path="*" element={<Navigate to="/home" replace />} />
     </Route>
   </Routes>
 </Router>
    </AuthProvider>
  );
};

export default App;
