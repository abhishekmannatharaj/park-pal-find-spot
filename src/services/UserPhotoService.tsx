
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PhotoMetadata {
  description?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
  tags?: string[];
}

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  spot_id?: string;
  metadata?: PhotoMetadata;
  created_at: string;
}

export const uploadPhoto = async (
  file: File, 
  userId: string, 
  spotId?: string, 
  metadata?: PhotoMetadata
): Promise<Photo | null> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}`;
    const filePath = `${userId}/${fileName}.${fileExt}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);
    
    if (!data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    // Insert record in photos table
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        url: data.publicUrl,
        spot_id: spotId,
        metadata
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    
    toast.success('Photo uploaded successfully');
    return photo as Photo;
  } catch (error) {
    console.error('Error uploading photo:', error);
    toast.error('Failed to upload photo. Please try again.');
    return null;
  }
};

export const getUserPhotos = async (userId: string): Promise<Photo[]> => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as Photo[];
  } catch (error) {
    console.error('Error fetching photos:', error);
    toast.error('Failed to fetch photos. Please try again.');
    return [];
  }
};

export const deletePhoto = async (photoId: string): Promise<boolean> => {
  try {
    // First get the photo to find the storage path
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Extract path from URL - this assumes URL format from Supabase storage
    const url = new URL((photo as Photo).url);
    const pathParts = url.pathname.split('/');
    const storagePath = pathParts.slice(pathParts.indexOf('object') + 1).join('/');
    
    // Delete from storage
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([storagePath]);
      
      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue anyway to delete the database record
      }
    }
    
    // Delete record
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);
    
    if (dbError) throw dbError;
    
    toast.success('Photo deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    toast.error('Failed to delete photo. Please try again.');
    return false;
  }
};
