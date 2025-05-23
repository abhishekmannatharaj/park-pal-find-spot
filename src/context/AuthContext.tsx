
import React, { createContext, useState, useContext, useEffect } from 'react';

export type UserRole = 'vehicle_owner' | 'space_owner';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('nexlot_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Dummy login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create dummy user
    const dummyUser: User = {
      id: '1234567890',
      email,
      name: email.split('@')[0],
      role: 'vehicle_owner',
      isVerified: false,
    };
    
    // Save user to local storage
    localStorage.setItem('nexlot_user', JSON.stringify(dummyUser));
    setUser(dummyUser);
    setIsLoading(false);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('nexlot_user');
    setUser(null);
  };

  // Switch role function
  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      localStorage.setItem('nexlot_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
