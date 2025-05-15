
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Images } from 'lucide-react';

// Import new components
import ProfileHeader from './ProfileHeader';
import RoleSwitch from './RoleSwitch';
import VerificationStatus from './VerificationStatus';
import DocumentUploader from './DocumentUploader';
import ManualReviewDialog from './ManualReviewDialog';
import LogoutConfirmDialog from './LogoutConfirmDialog';
import PhotosDialog from './PhotosDialog';

const ProfilePage: React.FC = () => {
  const { user, profile, logout, switchRole, uploadAvatar } = useAuth();
  const [isVehicleOwner, setIsVehicleOwner] = useState(profile?.role === 'vehicle_owner');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showManualReviewDialog, setShowManualReviewDialog] = useState(false);
  const [showPhotosDialog, setShowPhotosDialog] = useState(false);
  
  const handleRoleChange = async (checked: boolean) => {
    const newRole = checked ? 'vehicle_owner' : 'space_owner';
    setIsVehicleOwner(checked);
    await switchRole(newRole);
  };
  
  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };
  
  const handleAvatarUpload = async (file: File) => {
    if (!user) {
      toast.error('You need to be logged in to upload an avatar');
      return;
    }
    
    const result = await uploadAvatar(file);
    if (result) {
      toast.success('Avatar updated successfully');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {/* Profile Header with Avatar */}
          <ProfileHeader onAvatarChange={handleAvatarUpload} />
          
          <div className="w-full space-y-4">
            {/* Role Switch */}
            <RoleSwitch 
              isVehicleOwner={isVehicleOwner} 
              onRoleChange={handleRoleChange} 
            />
            
            {/* Verification Status (only shown for space owners) */}
            {!isVehicleOwner && (
              <VerificationStatus
                onUploadDocument={() => setShowVerificationDialog(true)}
                onManualReview={() => setShowManualReviewDialog(true)}
              />
            )}

            {/* Photo Management Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowPhotosDialog(true)}
            >
              <Images size={16} className="mr-2" />
              Manage Photos
            </Button>
            
            {/* Logout Button */}
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <LogoutConfirmDialog 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onLogout={handleLogout}
      />
      
      <DocumentUploader
        isOpen={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
      />
      
      <ManualReviewDialog
        isOpen={showManualReviewDialog}
        onClose={() => setShowManualReviewDialog(false)}
      />
      
      <PhotosDialog
        isOpen={showPhotosDialog}
        onClose={() => setShowPhotosDialog(false)}
      />
    </div>
  );
};

export default ProfilePage;
