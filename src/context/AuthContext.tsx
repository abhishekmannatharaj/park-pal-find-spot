
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

export type UserRole = 'vehicle_owner' | 'space_owner' | 'admin';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  canSwitchRole: () => boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to clean up auth state to prevent auth limbo
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('nexlot_user');
  
  // Remove all Supabase auth keys
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Defer profile fetching to prevent potential deadlocks
          setTimeout(async () => {
            const userProfile = await fetchProfile(currentSession.user.id);
            setProfile(userProfile);
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).then(userProfile => {
          setProfile(userProfile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Handle admin login separately
    if (email.toLowerCase() === 'admin' && password === 'admin') {
      const adminUser: Profile = {
        id: 'admin-id',
        email: 'admin@nexlot.app',
        name: 'Admin',
        role: 'admin',
      };
      
      localStorage.setItem('nexlot_user', JSON.stringify(adminUser));
      setProfile(adminUser as Profile);
      setIsLoading(false);
      return;
    }
    
    try {
      // Clean up auth state
      cleanupAuthState();
      
      try {
        // Global signout first
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // User data is handled by the auth state listener
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.message || 'Failed to login. Please try again.');
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (
    email: string, 
    password: string, 
    name: string,
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Clean up auth state
      cleanupAuthState();
      
      try {
        // Global signout first
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Signup with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) throw error;
      
      toast.success('Account created! Please check your email for verification.');
      
      // User data is handled by the auth state listener
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Special case for admin
      if (profile?.role === 'admin') {
        localStorage.removeItem('nexlot_user');
        setUser(null);
        setProfile(null);
        return;
      }
      
      await supabase.auth.signOut({ scope: 'global' });
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  // Check if user can switch roles (admin cannot switch roles)
  const canSwitchRole = () => {
    return user && profile && profile.role !== 'admin';
  };

  // Switch role function
  const switchRole = async (role: UserRole): Promise<void> => {
    if (!profile || profile.role === 'admin') return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, role } : null);
      
      toast.success(`Switched to ${role.replace('_', ' ')} mode`);
    } catch (error) {
      console.error('Error switching role:', error);
      toast.error('Failed to switch role. Please try again.');
    }
  };
  
  // Update user profile
  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };
  
  // Upload avatar function
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
      
      // Update profile
      if (data.publicUrl) {
        await updateProfile({ avatar_url: data.publicUrl });
        return data.publicUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      switchRole,
      canSwitchRole,
      updateProfile,
      uploadAvatar,
      session
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
