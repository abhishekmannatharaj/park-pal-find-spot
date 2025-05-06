
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, List, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/map', label: 'Home', icon: Home },
    { path: '/bookings', label: 'Bookings', icon: BookOpen },
    ...(user?.role === 'space_owner' ? [{ path: '/spots', label: 'Spots', icon: List }] : []),
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16">
        {children}
      </main>
      
      <nav className="bottom-nav shadow-lg">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`bottom-nav-icon ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
