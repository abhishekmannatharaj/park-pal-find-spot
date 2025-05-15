
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import { Upload, X, FileImage } from 'lucide-react';
import { uploadPhoto, PhotoMetadata } from '@/services/UserPhotoService';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PhotoUploaderProps {
  spotId?: string;
  onPhotoUploaded?: () => void;
  title?: string;
  showDescription?: boolean;
  showTags?: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  spotId,
  onPhotoUploaded,
  title = "Upload Photo",
  showDescription = true,
  showTags = true
}) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }
    
    // Check file type
    if (!file.type.match('image/(jpeg|jpg|png|webp)')) {
      toast.error('Invalid file type. Please upload JPG, PNG, or WebP images.');
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setDescription('');
    setTags('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast.error('Please select a file and ensure you are logged in');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Prepare metadata
      const metadata: PhotoMetadata = {};
      
      if (description) {
        metadata.description = description;
      }
      
      if (tags) {
        metadata.tags = tags.split(',').map(tag => tag.trim());
      }
      
      const result = await uploadPhoto(selectedFile, user.id, spotId, metadata);
      
      if (result) {
        toast.success('Photo uploaded successfully');
        handleCancelSelection();
        onPhotoUploaded?.();
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedFile ? (
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleSelectClick}
          >
            <FileImage size={36} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 mb-1">Click to select a photo</p>
            <p className="text-xs text-gray-400">JPEG, PNG or WebP (max 5MB)</p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview || ''}
                alt="Preview"
                className="w-full h-48 object-contain border rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleCancelSelection}
              >
                <X size={14} />
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </p>
            
            {showDescription && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description for your photo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            )}
            
            {showTags && (
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Add tags separated by commas"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            )}
            
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoUploader;
