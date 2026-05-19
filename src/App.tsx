// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
// import NominationPage from './pages/NominationPage';

import Login from './pages/auth/Login/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import type { UserRole } from './dataTypes/roles';
import { ROLE_PAGES } from './dataTypes/roles';
import { AuthProvider } from './components/ContextAPI/AuthContext.tsx';
import ForgotPassword from './pages/auth/Login/ForgotPassword.tsx';
import Study from './components/StudyModule/StudyMasterModule/Study.tsx';
import VerifyOtp from './pages/auth/Login/VerifyOtp';
import ResetPassword from './pages/auth/Login/ResetPassword';
import SiteModule from './components/StudyModule/SiteRegistrationModule/SiteModule.tsx';
import AmendmentModule from './components/StudyModule/StudyAmendmentModule/AmendmentModule.tsx';

//import PresidentLevelDetail from './components/PresidentLevel/PresidentLevelDetail.tsx';

//import BusinessJuryEvaluation from './components/Jury/BusinessJuryEvaluation.tsx';



import Dashboard from './components/Dashboard/Dashboard.tsx';
// -------------------------
// Main page components
// -------------------------
const HomeWithKey = () => {
  const location = useLocation();
  return <HomePage key={location.key} />;
};


const pageComponents: Record<string, React.ReactNode> = {
  'Admin': <Dashboard />,
  'Home': <HomeWithKey  />,
  'Study': <Study  />,
  'AmendmentModule': <AmendmentModule />,
  'SiteModule': <SiteModule />,

  // 'My Nominations': <NominationPage />,
  
};



// -------------------------
// Admin sub-pages
// -------------------------
const adminSubPages: Record<string, React.ReactNode> = {
  // 'award-categories': <AwardCategories />,
  // 'entities-departments': <EntitiesDepartments />,
  // 'nomination-cycle': <NominationCycleMaster />,
  // 'jury-panel-setup': <JuryPanelSetup />,
  // 'jury-evaluation-settings': <JuryEvaluationConfiguration />,
  // 'jury-role-mapping': <JuryRoleMapping />,
  // 'role-list': <RoleAccessLevels />,
  
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
    
 {/* Self Nomination */}
       

       {/* Add Nomination nested route */}
     
        {/* <Route
          path="/business-jury-evaluation"
          element={<BusinessJuryEvaluation />}
        /> */}
        {/* <Route
          path="/presidentlevel-detail/:nominationId"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={getAllowedRoles('President Details')}>
              <PresidentLevelDetail />
            </ProtectedRoute>
          }
        /> */}
       {/* Fallback */}
         <Route
  path="/study/master"
  element={
    <ProtectedRoute userRole={userRole} allowedRoles={['admin']}>
      <Study />
    </ProtectedRoute>
  }
/>

<Route
  path="/study/amendment"
  element={
    <ProtectedRoute userRole={userRole} allowedRoles={['admin']}>
      <AmendmentModule />
    </ProtectedRoute>
  }
/>

<Route
  path="/study/site"
  element={
    <ProtectedRoute userRole={userRole} allowedRoles={['admin']}>
      <SiteModule />
    </ProtectedRoute>
  }
/>
        <Route path="/forgot" element={<ForgotPassword/>} />
       <Route path="*" element={<Navigate to="/home" replace />} />
     </Route>
   </Routes>
 </Router>
    </AuthProvider>
  );
};

export default App;
