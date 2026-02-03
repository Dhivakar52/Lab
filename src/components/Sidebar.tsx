import React from 'react';

import {
  Home,
  Bell,
  User,
  FileText,
  Settings,
  CircleCheckBig,
  Gavel,
  Users,
  Award,
  Shield,
  ClipboardList,
  UserPlus, ChevronLeft,
  LogOut,X
} from "lucide-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/layout_logo.png';
import tree from '../assets/images/tree.png'
import type { UserRole } from '../dataTypes/roles';
import {ROLE_PAGES} from '../dataTypes/roles';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles?: UserRole[];
}

const navigationItems: NavigationItem[] = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'Self Nominations', path: '/self-nominations' },
  { icon: FileText, label: 'My Nominations', path: '/my-nominations' },
   { icon: Settings, label: 'Grand Jury', path: '/grand-jury' },
   { icon: Settings, label: 'Primary Business Jury', path: '/primary-business-jury' },
      
   { icon: Settings, label: 'Leader Board', path: '/leader-board' },
  { icon: ClipboardList, label: 'Referral Approval', path: '/referral-approval' },
  { icon: CircleCheckBig, label: 'Approvals', path: '/approvals' },
  { icon: Gavel, label: 'Business Jury', path: '/business-jury' },
  { icon: Shield, label: 'President Unit', path: '/president-unit' },
  { icon: Users, label: 'President Level', path: '/president-level' },
  { icon: Award, label: 'Award Management', path: '/award-management' },
   
  { icon: Settings, label: 'Admin Setting', path: '/admin-setting' },
 
  //{ icon: UserPlus, label: 'Other Nomination', path: '/other-nomination' },
];





const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobileOpen, onToggle, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') as UserRole | null;
const allowedPages = userRole ? ROLE_PAGES[userRole] : [];

  // const handleLogout = () => navigate('/');


  const handleLogout = () => {
  localStorage.clear();    
  sessionStorage.clear();   
   navigate('/');
};

  const activeStyle = {
    background: 'linear-gradient(90deg, rgba(8, 128, 94, 1) 16%, rgba(24, 97, 174, 1) 100%)',
    borderLeft: '4px solid white',
    color: 'white',
  };

  const filteredNavItems = navigationItems.filter(item =>
  allowedPages.some(page => page.trim() === item.label.trim())
);

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onMobileClose} />}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 bg-white text-black/90 transition-all duration-300 ease-in-out shadow-xl
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} ${isMobileOpen ? 'w-64' : 'w-0 lg:w-20'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-hidden`}>
        
        <button onClick={onMobileClose} className="absolute top-4 right-4 lg:hidden w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><X size={16} /></button>
        {/* <button onClick={onToggle} className=" lg:block absolute -right-3 z-20 top-5 w-6 h-6 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"><ChevronLeft size={16} /></button> */}
          <button
        onClick={onToggle}
        className="lg:block absolute -right-3 z-20 top-5 w-6 h-6 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
      >
        <ChevronLeft size={16} />
      </button>

       <div className="p-5 flex items-center border-b-1 shadow-lg border-white/10 min-h-[70px]">
  <div className="relative w-[106px] h-[40px]">
    
    {/* Full logo */}
    <img
      src={logo}
      alt="logo"
      className={`
        absolute inset-0 w-full h-full 
        transition-all duration-300 ease-in-out
        ${(!isCollapsed || isMobileOpen)
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95"}
      `}
    />

    {/* Tree icon */}
    <img
      src={tree}
      alt="logo"
      className={`
        absolute inset-0 w-full h-full
        transition-all duration-300 ease-in-out
        ${(!isCollapsed || isMobileOpen)
          ? "opacity-0 scale-95"
          : "opacity-100 scale-100"}
      `}
    />

  </div>
</div>


        <nav className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
          {filteredNavItems
           .filter(item => allowedPages.includes(item.label))
            .map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`flex items-center px-4 py-3 rounded-xl cursor-pointer ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
                  style={isActive ? activeStyle : {}}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {(!isCollapsed || isMobileOpen) && <span className="ml-3 text-sm">{item.label}</span>}
                </Link>
              );
            })}
        </nav>

        <div className="absolute bg-white bottom-5 left-0 right-0 px-5">
          <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/10 ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`} onClick={handleLogout}>
           <LogOut size={20}  className="cursor-pointer" />
            {(!isCollapsed || isMobileOpen) && <span className="ml-3 text-sm">Logout</span>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
