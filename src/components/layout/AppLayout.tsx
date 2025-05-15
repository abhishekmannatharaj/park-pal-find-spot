
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, List, User, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/map', label: 'Home', icon: Home },
    { path: '/bookings', label: 'Bookings', icon: BookOpen },
    ...(profile?.role === 'space_owner' ? [{ path: '/spots', label: 'Spots', icon: List }] : []),
    { path: '/photos', label: 'Photos', icon: Camera },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-2 z-10">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`flex flex-col items-center p-2 ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={20} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
