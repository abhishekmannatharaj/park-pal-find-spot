
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileSearch } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface VerificationStatusProps {
  onUploadDocument: () => void;
  onManualReview: () => void;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  onUploadDocument, 
  onManualReview 
}) => {
  const { profile } = useAuth();
  
  return (
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
                    onClick={onManualReview}
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
          onClick={onUploadDocument}
        >
          <span>Upload Document</span>
        </Button>
      </div>
    </div>
  );
};

export default VerificationStatus;
