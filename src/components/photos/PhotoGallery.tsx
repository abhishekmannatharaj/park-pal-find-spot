import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserPhotos, Photo, deletePhoto } from '@/services/UserPhotoService';
import { useAuth } from '@/context/AuthContext';
import { Trash, ImageOff } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PhotoGalleryProps {
  userId?: string;
  spotId?: string;
  title?: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  userId, 
  spotId,
  title = "Photo Gallery" 
}) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPhotos = async () => {
      const targetUserId = userId || (user ? user.id : null);
      
      if (!targetUserId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const fetchedPhotos = await getUserPhotos(targetUserId);
      
      // Filter photos by spotId if specified
      const filteredPhotos = spotId 
        ? fetchedPhotos.filter(photo => photo.spot_id === spotId)
        : fetchedPhotos;
        
      setPhotos(filteredPhotos);
      setIsLoading(false);
    };
    
    fetchPhotos();
  }, [user, userId, spotId]);
  
  const handleDeleteClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedPhoto) return;
    
    const success = await deletePhoto(selectedPhoto.id);
    if (success) {
      setPhotos(prev => prev.filter(p => p.id !== selectedPhoto.id));
    }
    
    setShowDeleteDialog(false);
    setSelectedPhoto(null);
  };
  
  const openLightbox = (photoUrl: string) => {
    setLightboxPhoto(photoUrl);
    setShowLightbox(true);
  };
  
  const canDelete = (photoUserId: string) => {
    return user && user.id === photoUserId;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading photos...</div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="relative group cursor-pointer rounded-md overflow-hidden"
                  onClick={() => openLightbox(photo.url)}
                >
                  <img 
                    src={photo.url} 
                    alt="Photo"
                    className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {canDelete(photo.user_id) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(photo);
                        }}
                      >
                        <Trash size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
              <ImageOff size={48} className="text-gray-300 mb-2" />
              <p>No photos available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox Dialog */}
      <AlertDialog open={showLightbox} onOpenChange={setShowLightbox}>
        <AlertDialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <img 
            src={lightboxPhoto || ''} 
            alt="Full size" 
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <AlertDialogFooter className="p-2 bg-white rounded-b-lg">
            <AlertDialogCancel className="m-0">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PhotoGallery;
