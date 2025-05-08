
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { CardFooter } from "@/components/ui/card";
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import refactored components
import SpotImageCarousel from './SpotImageCarousel';
import SpotDetailsTab from './SpotDetailsTab';
import BookingForm from './BookingForm';
import ActionButtons from './ActionButtons';
import ChatDialog from './ChatDialog';
import Reviews from './Reviews';

const SpotDetail: React.FC = () => {
  const { selectedSpot, setSelectedSpot, bookSpot } = useApp();
  const { user } = useAuth();
  const isSpaceOwner = user?.role === 'space_owner';
  const [isBooking, setIsBooking] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  
  // Booking form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [activeTab, setActiveTab] = useState('details');

  // Handler for booking form data changes
  const handleBookingDataChange = (
    newStartDate: string,
    newStartTime: string,
    newEndDate: string,
    newEndTime: string,
    newTotalCost: number
  ) => {
    setStartDate(newStartDate);
    setStartTime(newStartTime);
    setEndDate(newEndDate);
    setEndTime(newEndTime);
    setTotalCost(newTotalCost);
  };

  // Reset booking form when spot is closed or opened
  React.useEffect(() => {
    if (selectedSpot) {
      setIsBooking(false);
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setTotalCost(0);
      setActiveTab('details');
    }
  }, [selectedSpot]);

  if (!selectedSpot) return null;

  const handleGetDirections = () => {
    const { lat, lng } = selectedSpot.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleBookNow = () => {
    if (isBooking) {
      // Validate before submitting
      if (!startDate || !startTime || !endDate || !endTime) {
        return;
      }
      
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return;
      }
      
      if (end <= start) {
        return;
      }
      
      // Book the spot
      bookSpot(selectedSpot.id, start, end);
      setIsBooking(false);
    } else {
      setIsBooking(true);
    }
  };

  return (
    <Dialog 
      open={!!selectedSpot} 
      onOpenChange={(open) => !open && setSelectedSpot(null)}
    >
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto w-[95vw] md:w-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedSpot.name}</DialogTitle>
        </DialogHeader>
        
        {/* Image Carousel */}
        <SpotImageCarousel images={selectedSpot.images} name={selectedSpot.name} />
        
        {/* Tabs for Details and Reviews */}
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <SpotDetailsTab spot={selectedSpot} />
          </TabsContent>
          
          <TabsContent value="reviews">
            <Reviews spotId={selectedSpot.id} />
          </TabsContent>
        </Tabs>
        
        {/* Booking Form - Only show for vehicle owners */}
        {isBooking && !isSpaceOwner && (
          <BookingForm 
            spot={selectedSpot} 
            onBookingDataChange={handleBookingDataChange}
          />
        )}
        
        {/* Action Buttons */}
        <CardFooter className="flex flex-wrap gap-3 pt-0">
          <ActionButtons 
            onGetDirections={handleGetDirections}
            onChatWithOwner={() => setShowChatDialog(true)}
            onBookNow={handleBookNow}
            isBooking={isBooking}
            isBookingDisabled={!startDate || !startTime || !endDate || !endTime || totalCost === 0}
            isSpaceOwner={isSpaceOwner}
          />
        </CardFooter>
      </DialogContent>
      
      {/* Chat Dialog */}
      <ChatDialog 
        open={showChatDialog} 
        onOpenChange={setShowChatDialog}
        spotName={selectedSpot.name}
      />
    </Dialog>
  );
};

export default SpotDetail;
