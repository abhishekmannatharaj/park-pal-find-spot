
import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getUserPhotos, deletePhoto, uploadPhoto, Photo, PhotoMetadata } from '@/services/UserPhotoService';
import { useAuth } from '@/context/AuthContext';
import { Upload, Trash } from 'lucide-react';

interface PhotosDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PhotosDialog: React.FC<PhotosDialogProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch user photos when dialog opens
  useEffect(() => {
    if (isOpen && user) {
      const fetchPhotos = async () => {
        setIsLoadingPhotos(true);
        const photos = await getUserPhotos(user.id);
        setUserPhotos(photos);
        setIsLoadingPhotos(false);
      };
      
      fetchPhotos();
    }
  }, [isOpen, user]);
  
  const handleUploadClick = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      await handlePhotoUpload(file);
    }
  };
  
  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    
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
    <AlertDialog open={isOpen} onOpenChange={onClose}>
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
            onClick={handleUploadClick}
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
              onChange={handleFileChange}
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
  );
};

export default PhotosDialog;
