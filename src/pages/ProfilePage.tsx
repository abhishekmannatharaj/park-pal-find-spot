
import React from 'react';
import Profile from '@/components/profile/ProfilePage';
import AppLayout from '@/components/layout/AppLayout';

const ProfilePage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <Profile />
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
