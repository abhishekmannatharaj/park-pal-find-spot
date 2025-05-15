
import React from 'react';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface ManualReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManualReviewDialog: React.FC<ManualReviewDialogProps> = ({ isOpen, onClose }) => {
  const handleSubmitManualReview = () => {
    toast.success('Your request for manual review has been submitted');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
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
  );
};

export default ManualReviewDialog;
