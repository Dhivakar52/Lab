import React, { createContext, useContext, useState } from 'react';
import  type {  ReactNode } from 'react';
// Define the type for your context value
interface AuthContextType {
  authToken: string | null;
  email: string | null;
  refreshToken: string | null;
  userId: number | null;
  userRole: string | null;
  username: string | null;
  tenantname: string | null;

  setAuthData: (data: AuthContextType) => void;
  clearAuthData: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;  // Explicitly define `children` prop type
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [email, setEmail] = useState<string | null>(localStorage.getItem("email"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refreshToken"));
  const [userId, setUserId] = useState<number | null>(parseInt(localStorage.getItem("userId") || "0"));
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem("userRole"));
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
   const [tenantname, setTenantname] = useState<string | null>(
    localStorage.getItem("tenantname")
  );

  const setAuthData = (data: AuthContextType) => {
    console.log(data,"Data")
    setAuthToken(data.authToken);
    setEmail(data.email);
    setRefreshToken(data.refreshToken);
    setUserId(data.userId);
    setUserRole(data.userRole);
    setUsername(data.username);
      setTenantname(data.tenantname);


    // Save to localStorage
    localStorage.setItem("authToken", data.authToken || "");
    localStorage.setItem("email", data.email || "");
    localStorage.setItem("refreshToken", data.refreshToken || "");
    localStorage.setItem("userId", String(data.userId));
    localStorage.setItem("userRole", data.userRole || "");
    localStorage.setItem("username", data.username || "");
     localStorage.setItem("tenantname", data.tenantname || "");
  };

  const clearAuthData = () => {
    setAuthToken(null);
    setEmail(null);
    setRefreshToken(null);
    setUserId(null);
    setUserRole(null);
    setUsername(null);
     setTenantname(null);

    localStorage.removeItem("authToken");
    localStorage.removeItem("email");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
     localStorage.removeItem("tenantname");
  };

  return (
    <AuthContext.Provider value={{ authToken, email, refreshToken, userId, userRole, username,tenantname, setAuthData, clearAuthData }}>
      {children}  
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
