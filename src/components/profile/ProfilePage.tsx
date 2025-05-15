
import React, { useState, useRef, useEffect } from 'react';
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
import { Upload, LogOut, Trash, FileText, FileCheck, FileSearch, ImagePlus, Images } from 'lucide-react';
import { getUserPhotos, uploadPhoto, PhotoMetadata, Photo as PhotoType, deletePhoto } from '@/services/UserPhotoService';

const ProfilePage: React.FC = () => {
  const { user, profile, logout, switchRole, uploadAvatar } = useAuth();
  const [isVehicleOwner, setIsVehicleOwner] = useState(profile?.role === 'vehicle_owner');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [uploadedAgreement, setUploadedAgreement] = useState<File | null>(null);
  const [agreementPreview, setAgreementPreview] = useState<string | null>(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [showManualReviewDialog, setShowManualReviewDialog] = useState(false);
  const [showPhotosDialog, setShowPhotosDialog] = useState(false);
  const [userPhotos, setUserPhotos] = useState<PhotoType[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const agreementInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch user photos when dialog opens
  useEffect(() => {
    if (showPhotosDialog && user) {
      const fetchPhotos = async () => {
        setIsLoadingPhotos(true);
        const photos = await getUserPhotos(user.id);
        setUserPhotos(photos);
        setIsLoadingPhotos(false);
      };
      
      fetchPhotos();
    }
  }, [showPhotosDialog, user]);
  
  const handleRoleChange = async (checked: boolean) => {
    const newRole: UserRole = checked ? 'vehicle_owner' : 'space_owner';
    setIsVehicleOwner(checked);
    await switchRole(newRole);
  };
  
  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };
  
  const handleUploadClick = (type: 'document' | 'agreement' | 'photo' | 'avatar') => {
    if (type === 'document' && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (type === 'agreement' && agreementInputRef.current) {
      agreementInputRef.current.click();
    } else if (type === 'photo' && photoInputRef.current) {
      photoInputRef.current.click();
    } else if (type === 'avatar' && avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'agreement' | 'photo' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'document') {
        setUploadedDocument(file);
        const previewUrl = URL.createObjectURL(file);
        setDocumentPreview(previewUrl);
      } else if (type === 'agreement') {
        setUploadedAgreement(file);
        const previewUrl = URL.createObjectURL(file);
        setAgreementPreview(previewUrl);
      } else if (type === 'avatar') {
        setAvatarFile(file);
        handleAvatarUpload(file);
      } else if (type === 'photo') {
        handlePhotoUpload(file);
      }
    }
  };

  const handleDeleteDocument = (type: 'document' | 'agreement') => {
    if (type === 'document') {
      setUploadedDocument(null);
      if (documentPreview) {
        URL.revokeObjectURL(documentPreview);
        setDocumentPreview(null);
      }
    } else {
      setUploadedAgreement(null);
      if (agreementPreview) {
        URL.revokeObjectURL(agreementPreview);
        setAgreementPreview(null);
      }
    }
  };

  const handleSubmitDocument = () => {
    if (!uploadedDocument || !uploadedAgreement) {
      toast.error('Please upload both ID document and spot agreement');
      return;
    }
    setVerificationInProgress(true);
    toast.success('Documents uploaded successfully! We will verify them shortly.');
    setShowVerificationDialog(false);
  };
  
  const handleManualReview = () => {
    setShowManualReviewDialog(true);
  };
  
  const handleSubmitManualReview = () => {
    toast.success('Your request for manual review has been submitted');
    setShowManualReviewDialog(false);
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
  
  const handlePhotoUpload = async (file: File) => {
    if (!user) {
      toast.error('You need to be logged in to upload a photo');
      return;
    }
    
    const metadata: PhotoMetadata = {
      description: 'Photo uploaded from profile page',
      tags: ['profile']
    };
    
    const photo = await uploadPhoto(file, user.id, undefined, metadata);
    
    if (photo) {
      setUserPhotos(prev => [photo, ...prev]);
    }
  };
  
  const handleDeletePhoto = async (photoId: string) => {
    const success = await deletePhoto(photoId);
    
    if (success) {
      setUserPhotos(prev => prev.filter(p => p.id !== photoId));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150"} alt={profile?.name || "User"} />
              <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <Button 
              variant="secondary" 
              size="icon"
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-1 shadow-md"
              onClick={() => handleUploadClick('avatar')}
            >
              <ImagePlus size={16} />
              <input
                type="file"
                ref={avatarInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
              />
            </Button>
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold">{profile?.name || "User"}</h2>
            <p className="text-gray-500">{profile?.email}</p>
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
                    {profile?.verificationStatus ? (
                      <div className="flex items-center">
                        <span className={`text-sm mr-2 ${
                          profile.verificationStatus === 'approved' ? 'text-green-600' :
                          profile.verificationStatus === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {profile.verificationStatus.charAt(0).toUpperCase() + profile.verificationStatus.slice(1)}
                        </span>
                        {profile.verificationStatus === 'approved' && <span className="text-green-600">✓</span>}
                        {profile.verificationStatus === 'rejected' && <span className="text-red-600">✕</span>}
                        {profile.verificationStatus === 'pending' && (
                          <div className="flex space-x-2">
                            <span className="text-yellow-600">⏳</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="ml-2 text-xs"
                              onClick={handleManualReview}
                            >
                              <FileSearch size={14} className="mr-1" />
                              Appeal for Manual Review
                            </Button>
                          </div>
                        )}
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
                    disabled={verificationInProgress}
                  >
                    <Upload size={14} />
                    <span>Upload Document</span>
                  </Button>
                </div>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowPhotosDialog(true)}
            >
              <Images size={16} className="mr-2" />
              Manage Photos
            </Button>
            
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
      
      {/* Logout Confirmation Dialog */}
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
      
      {/* Document Verification Dialog */}
      <AlertDialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Verification Documents</AlertDialogTitle>
            <AlertDialogDescription>
              Please upload the following documents for verification:
              <ul className="list-disc list-inside mt-2">
                <li>A government-issued ID (Passport, Driver's License, or National ID)</li>
                <li>Agreement with spot details</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            {/* ID Document Upload */}
            <div>
              <Label className="font-medium">ID Document</Label>
              {documentPreview ? (
                <div className="relative mt-2">
                  <img 
                    src={documentPreview} 
                    alt="Document Preview"
                    className="w-full h-48 object-contain border rounded-md"
                  />
                  {!verificationInProgress && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="absolute top-2 right-2 p-1 h-8 w-8"
                      onClick={() => handleDeleteDocument('document')}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    {uploadedDocument?.name} ({Math.round((uploadedDocument?.size || 0) / 1024)} KB)
                  </p>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-32 flex flex-col items-center justify-center border-dashed mt-2"
                  onClick={() => handleUploadClick('document')}
                  disabled={verificationInProgress}
                >
                  <FileText size={24} className="mb-2" />
                  <span>Upload ID document</span>
                  <span className="text-xs text-gray-500 mt-1">JPG, PNG or PDF</span>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleFileChange(e, 'document')}
                    disabled={verificationInProgress}
                  />
                </Button>
              )}
            </div>

            {/* Agreement Upload */}
            <div>
              <Label className="font-medium">Spot Agreement</Label>
              {agreementPreview ? (
                <div className="relative mt-2">
                  <img 
                    src={agreementPreview} 
                    alt="Agreement Preview"
                    className="w-full h-48 object-contain border rounded-md"
                  />
                  {!verificationInProgress && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="absolute top-2 right-2 p-1 h-8 w-8"
                      onClick={() => handleDeleteDocument('agreement')}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    {uploadedAgreement?.name} ({Math.round((uploadedAgreement?.size || 0) / 1024)} KB)
                  </p>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-32 flex flex-col items-center justify-center border-dashed mt-2"
                  onClick={() => handleUploadClick('agreement')}
                  disabled={verificationInProgress}
                >
                  <FileText size={24} className="mb-2" />
                  <span>Upload spot agreement</span>
                  <span className="text-xs text-gray-500 mt-1">JPG, PNG or PDF</span>
                  <input 
                    type="file" 
                    ref={agreementInputRef}
                    className="hidden" 
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleFileChange(e, 'agreement')}
                    disabled={verificationInProgress}
                  />
                </Button>
              )}
            </div>

            {verificationInProgress && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
                <FileCheck className="text-yellow-500 mr-2" size={18} />
                <span className="text-sm text-yellow-700">Verification in progress. We'll notify you once complete.</span>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={verificationInProgress}>Cancel</AlertDialogCancel>
            {!verificationInProgress && (
              <AlertDialogAction 
                onClick={handleSubmitDocument}
                disabled={!uploadedDocument || !uploadedAgreement}
              >
                Submit for Verification
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manual Review Dialog */}
      <AlertDialog open={showManualReviewDialog} onOpenChange={setShowManualReviewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Manual Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to request a manual review of your verification documents? 
              This may take additional time but will be reviewed by a human instead of our automated system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitManualReview}>
              Submit Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Photos Management Dialog */}
      <AlertDialog open={showPhotosDialog} onOpenChange={setShowPhotosDialog}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Manage Photos</AlertDialogTitle>
            <AlertDialogDescription>
              Upload and manage your photos
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <Button 
              variant="outline" 
              className="w-full border-dashed flex items-center justify-center p-6"
              onClick={() => handleUploadClick('photo')}
            >
              <div className="flex flex-col items-center">
                <Upload size={24} className="mb-2" />
                <span>Upload New Photo</span>
                <span className="text-xs text-gray-500 mt-1">JPG, PNG or WebP</span>
              </div>
              <input 
                type="file" 
                ref={photoInputRef}
                className="hidden" 
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, 'photo')}
              />
            </Button>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Your Photos</h3>
              
              {isLoadingPhotos && (
                <div className="text-center py-8">Loading...</div>
              )}
              
              {!isLoadingPhotos && userPhotos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  You haven't uploaded any photos yet
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                {userPhotos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img 
                      src={photo.url} 
                      alt="User photo" 
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                      <Button 
                        variant="destructive"
                        size="sm"
                        className="opacity-90"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <Trash size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      {new Date(photo.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;
