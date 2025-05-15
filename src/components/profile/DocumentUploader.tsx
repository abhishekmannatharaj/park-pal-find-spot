
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash, FileText, FileCheck } from 'lucide-react';
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

interface DocumentUploaderProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ isOpen, onClose }) => {
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [uploadedAgreement, setUploadedAgreement] = useState<File | null>(null);
  const [agreementPreview, setAgreementPreview] = useState<string | null>(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const agreementInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = (type: 'document' | 'agreement') => {
    if (type === 'document' && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (type === 'agreement' && agreementInputRef.current) {
      agreementInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'agreement') => {
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
    onClose();
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open && !verificationInProgress) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleDialogClose}>
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
  );
};

export default DocumentUploader;
