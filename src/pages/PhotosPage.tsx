
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PhotoGallery from '@/components/photos/PhotoGallery';
import PhotoUploader from '@/components/photos/PhotoUploader';
import { useAuth } from '@/context/AuthContext';

const PhotosPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  const handlePhotoUploaded = () => {
    // Trigger a refresh of the gallery
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Photos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <PhotoUploader 
              title="Upload New Photo" 
              onPhotoUploaded={handlePhotoUploaded} 
            />
          </div>
          
          <div className="md:col-span-2">
            <PhotoGallery 
              key={refreshTrigger} 
              userId={user?.id} 
              title="My Photos" 
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PhotosPage;
