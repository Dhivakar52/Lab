import React, { useState, useEffect } from 'react';
import {
  Home,
  SquareLibrary,
  ChevronLeft,
  LogOut,
  X,
  BrickWallShield,
  ChevronDown,
   FileText,
  ClipboardList,
  Calendar,
  User,

   
  FileEdit,
  Building2,
  Users,
  UserPlus,
  
  CalendarDays,
  AlertTriangle,

  
} from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/layout_logo.png';
import tree from '../assets/images/tree.png';
import type { UserRole } from '../dataTypes/roles';
import { ROLE_PAGES } from '../dataTypes/roles';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

interface NavigationItem {
  icon?: React.ElementType;
  label: string;
  path?: string;
  pageKey: string;
  roles?: UserRole[];
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { icon: Home, label: 'Home', path: '/home', pageKey: 'Home' },

  // ✅ STUDY
  {
    icon: SquareLibrary,
    label: 'Study',
    pageKey: 'Study',
    children: [
      { icon: FileText, label: 'Study Master', path: '/study/master', pageKey: 'Study' },
      { icon: FileEdit, label: 'Study Amendment', path: '/study/amendment', pageKey: 'AmendmentModule' },
      { icon: Building2, label: 'Site Registration', path: '/study/site', pageKey: 'Site Registration' },
    ],
  },

  // ✅ SUBJECT
  {
    icon: Users,
    label: 'Subject',
    pageKey: 'Subject',
    children: [
      { icon: UserPlus, label: 'Subject Enrollment', path: '/subject/enrollment', pageKey: 'Enrollment' },
      { icon: AlertTriangle, label: 'Adverse Events', path: '/subject/adverse', pageKey: 'Adverse' },
    ],
  },

  // ✅ VISIT
  {
    icon: CalendarDays,
    label: 'Visit Schedule',
    path: '/visit',
    pageKey: 'Visit',
  },

  // ✅ ADMIN
  {
    icon: BrickWallShield,
    label: 'Admin',
    path: '/admin',
    pageKey: 'Admin',
  },
];

// -------------------------
// NavItem Component
// -------------------------
const NavItem = ({
  item,
  isCollapsed,
  isMobileOpen,
  onMobileClose,
  depth = 0,
}: {
  item: NavigationItem;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  depth?: number;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChildren = item.children && item.children.length > 0;

  // ✅ FIXED: Check if this item or any of its children is active
  const isActive = () => {
    // If current item has a path and matches exactly
    if (item.path && location.pathname === item.path) {
      return true;
    }
    
    // If current item has children and any child path matches
    if (hasChildren) {
      return item.children!.some((child) => location.pathname === child.path);
    }
    
    return false;
  };

  const isParentOfActive = hasChildren && 
    item.children!.some((child) => location.pathname === child.path);

  // Auto expand parent if child is active
  useEffect(() => {
    if (isParentOfActive) {
      setIsExpanded(true);
    }
  }, [location.pathname, isParentOfActive]);

  // 🎯 Active class logic
  const getActiveClass = () => {
    const active = isActive();
    
    // Main menu item (depth === 0)
    if (depth === 0) {
      if (active) {
        return 'bg-blue-100 text-blue-600'; // Active main menu
      }
      return 'hover:bg-gray-100';
    }
    
    // Sub menu item (depth > 0)
    if (active) {
      return 'bg-gray-400 text-white'; // Active sub menu
    }
    
    return 'hover:bg-gray-100';
  };

  const handleClick = () => {
    if (hasChildren) {
      // If has children, just toggle expansion
      if (!isCollapsed || isMobileOpen) {
        setIsExpanded(!isExpanded);
      }
    } else if (item.path) {
      // If no children and has path, navigate
      navigate(item.path);
      onMobileClose();
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
          ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}
          ${getActiveClass()}
        `}
        style={{
          paddingLeft: depth > 0 ? `${1.5 + depth * 0.5}rem` : undefined,
        }}
      >
        {item.icon && <item.icon size={20} className="flex-shrink-0" />}

        {(!isCollapsed || isMobileOpen) && (
          <>
            <span className="ml-3 text-sm flex-1">{item.label}</span>

            {hasChildren && (
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            )}
          </>
        )}
      </div>

      {/* Sub Menu */}
      {hasChildren && isExpanded && (!isCollapsed || isMobileOpen) && (
        <div className="ml-2 space-y-1 mt-1">
          {item.children!.map((child) => (
            <NavItem
              key={child.pageKey}
              item={child}
              isCollapsed={isCollapsed}
              isMobileOpen={isMobileOpen}
              onMobileClose={onMobileClose}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// -------------------------
// Sidebar Component
// -------------------------
const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onToggle,
  onMobileClose,
}) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') as UserRole | null;
  const allowedPages = userRole ? ROLE_PAGES[userRole] : [];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/', { replace: true });
  };

  const filteredNavItems = navigationItems.filter((item) =>
    allowedPages.includes(item.pageKey)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-30 bg-white text-black/90 
          transition-all duration-300 ease-in-out shadow-xl
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
          ${isMobileOpen ? 'w-64' : 'w-0 lg:w-20'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-hidden
        `}
      >
        {/* Close (mobile) */}
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 lg:hidden w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
        >
          <X size={16} />
        </button>

        {/* Toggle */}
        <button
          onClick={onToggle}
          className="lg:block absolute -right-3 z-20 top-5 w-6 h-6 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Logo */}
        <div className="p-5 flex items-center border-b border-white shadow-lg min-h-[70px]">
          <div className="relative w-[106px] h-[40px]">
            <img
              src={logo}
              className={`absolute inset-0 w-full h-full transition ${
                !isCollapsed || isMobileOpen
                  ? 'opacity-100'
                  : 'opacity-0'
              }`}
            />
            <img
              src={tree}
              className={`absolute inset-0 w-full h-full transition ${
                !isCollapsed || isMobileOpen
                  ? 'opacity-0'
                  : 'opacity-100'
              }`}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-2 max-h-[70vh] overflow-y-auto custom-scroll">
          {filteredNavItems.map((item) => (
            <NavItem
              key={item.pageKey}
              item={item}
              isCollapsed={isCollapsed}
              isMobileOpen={isMobileOpen}
              onMobileClose={onMobileClose}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-5 left-0 right-0 px-5">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-100
              ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}
            `}
          >
            <LogOut size={20} />
            {(!isCollapsed || isMobileOpen) && (
              <span className="ml-3 text-sm">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;