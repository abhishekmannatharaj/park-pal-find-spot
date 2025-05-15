
import React, { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImagePlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ProfileHeaderProps {
  onAvatarChange: (file: File) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onAvatarChange }) => {
  const { profile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={profile?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150"} 
            alt={profile?.name || "User"} 
          />
          <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <Button 
          variant="secondary" 
          size="icon"
          className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-1 shadow-md"
          onClick={handleUploadClick}
        >
          <ImagePlus size={16} />
          <input
            type="file"
            ref={avatarInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
      </div>
      
      <div className="text-center">
        <h2 className="text-xl font-bold">{profile?.name || "User"}</h2>
        <p className="text-gray-500">{profile?.email}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
