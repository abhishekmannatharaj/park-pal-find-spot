
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';

interface ActionButtonsProps {
  onGetDirections: () => void;
  onChatWithOwner: () => void;
  onBookNow: () => void;
  isBooking: boolean;
  isBookingDisabled: boolean;
  isSpaceOwner: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onGetDirections,
  onChatWithOwner,
  onBookNow,
  isBooking,
  isBookingDisabled,
  isSpaceOwner
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        variant="outline" 
        className="flex-1 min-w-[120px]"
        onClick={onGetDirections}
      >
        Get Directions
      </Button>
      
      <Button 
        variant="outline" 
        className="flex-1 min-w-[120px]"
        onClick={onChatWithOwner}
      >
        <MessageCircle size={16} className="mr-1" />
        Chat with Owner
      </Button>
      
      {!isSpaceOwner && (
        <Button 
          className="flex-1 min-w-[120px] bg-primary hover:bg-primary/90"
          onClick={onBookNow}
          disabled={isBooking && isBookingDisabled}
        >
          {isBooking ? 'Confirm Booking' : 'Book Now'}
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
