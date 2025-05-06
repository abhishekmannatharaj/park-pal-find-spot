
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Upload, LogOut, Trash } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const [isVehicleOwner, setIsVehicleOwner] = useState(user?.role === 'vehicle_owner');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleRoleChange = (checked: boolean) => {
    const newRole: UserRole = checked ? 'vehicle_owner' : 'space_owner';
    setIsVehicleOwner(checked);
    switchRole(newRole);
    toast.success(`Switched to ${checked ? 'Vehicle Owner' : 'Space Owner'} mode`);
  };
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedDocument(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setDocumentPreview(previewUrl);
    }
  };

  const handleDeleteDocument = () => {
    setUploadedDocument(null);
    if (documentPreview) {
      URL.revokeObjectURL(documentPreview);
      setDocumentPreview(null);
    }
  };

  const handleSubmitDocument = () => {
    toast.success('Document uploaded successfully! We will verify it shortly.');
    setShowVerificationDialog(false);
    // In a real app, we would upload the file to a server
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="role-switch">User Mode</Label>
              <div className="flex items-center gap-2">
                <span className={!isVehicleOwner ? 'font-medium' : 'text-gray-500'}>Space Owner</span>
                <Switch 
                  id="role-switch" 
                  checked={isVehicleOwner}
                  onCheckedChange={handleRoleChange}
                />
                <span className={isVehicleOwner ? 'font-medium' : 'text-gray-500'}>Vehicle Owner</span>
              </div>
            </div>
            
            {!isVehicleOwner && (
              <div className="space-y-2">
                <Label>Verification Status</Label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div>
                    {user?.verificationStatus ? (
                      <div className="flex items-center">
                        <span className={`text-sm mr-2 ${
                          user.verificationStatus === 'approved' ? 'text-green-600' :
                          user.verificationStatus === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1)}
                        </span>
                        {user.verificationStatus === 'approved' && <span className="text-green-600">✓</span>}
                        {user.verificationStatus === 'rejected' && <span className="text-red-600">✕</span>}
                        {user.verificationStatus === 'pending' && <span className="text-yellow-600">⏳</span>}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not Verified</span>
                    )}
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setShowVerificationDialog(true)}
                  >
                    <Upload size={14} />
                    <span>Upload Document</span>
                  </Button>
                </div>
              </div>
            )}
            
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
      
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Verification Document</AlertDialogTitle>
            <AlertDialogDescription>
              Please upload a government-issued ID for verification. We accept Passport, Driver's License, or National ID.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            {documentPreview ? (
              <div className="relative">
                <img 
                  src={documentPreview} 
                  alt="Document Preview"
                  className="w-full h-48 object-contain border rounded-md"
                />
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="absolute top-2 right-2 p-1 h-8 w-8"
                  onClick={handleDeleteDocument}
                >
                  <Trash size={16} />
                </Button>
                <p className="mt-2 text-sm text-center text-gray-500">
                  {uploadedDocument?.name} ({Math.round((uploadedDocument?.size || 0) / 1024)} KB)
                </p>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full h-32 flex flex-col items-center justify-center border-dashed"
                onClick={handleUploadClick}
              >
                <Upload size={24} className="mb-2" />
                <span>Click to upload document</span>
                <span className="text-xs text-gray-500 mt-1">JPG, PNG or PDF</span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                />
              </Button>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {documentPreview && (
              <AlertDialogAction onClick={handleSubmitDocument}>
                Submit for Verification
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;
