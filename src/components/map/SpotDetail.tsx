
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { 
  Star, 
  Calendar, 
  Clock,
  Car, 
  Bike,
  MapPin,
  MessageCircle
} from "lucide-react";
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { cn, formatCurrency } from '@/lib/utils';

const SpotDetail: React.FC = () => {
  const { selectedSpot, setSelectedSpot, bookSpot } = useApp();
  const { user } = useAuth();
  const isSpaceOwner = user?.role === 'space_owner';
  const [isBooking, setIsBooking] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  
  // Booking form state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [chatMessage, setChatMessage] = useState('');

  // Calculate total cost when times or dates change
  React.useEffect(() => {
    if (startDate && startTime && endDate && endTime && selectedSpot) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        // Calculate the duration in hours
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        
        // Calculate the cost
        const cost = selectedSpot.price.hourly * durationHours;
        setTotalCost(cost);
      } else {
        setTotalCost(0);
      }
    } else {
      setTotalCost(0);
    }
  }, [startDate, startTime, endDate, endTime, selectedSpot]);

  // Reset booking form when spot is closed or opened
  React.useEffect(() => {
    if (selectedSpot) {
      setIsBooking(false);
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setTotalCost(0);
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
  
  const handleChatWithOwner = () => {
    setShowChatDialog(true);
  };
  
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // In a real app, this would send the message to the owner
      setChatMessage('');
      // Mock a response
      setTimeout(() => {
        setShowChatDialog(false);
        alert('Message sent to the spot owner. They will respond shortly.');
      }, 500);
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <Car size={14} className="mr-1" />;
      case 'bike':
        return <Bike size={14} className="mr-1" />;
      case 'sedan':
      case 'hatchback':
      case 'suv':
        return <Car size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={!!selectedSpot} 
      onOpenChange={(open) => !open && setSelectedSpot(null)}
    >
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedSpot.name}</DialogTitle>
        </DialogHeader>
        
        {/* Image Carousel */}
        <Carousel className="w-full">
          <CarouselContent>
            {selectedSpot.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-0">
                      <img 
                        src={image} 
                        alt={`${selectedSpot.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        
        {/* Spot Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1">
            <Star size={16} className="text-yellow-500" fill="currentColor" />
            <span className="font-medium">{selectedSpot.rating}</span>
            <span className="text-gray-500 text-sm">• Rating</span>
          </div>
          
          <p className="text-sm text-gray-600">{selectedSpot.description}</p>
          
          {selectedSpot.address && (
            <p className="text-sm text-gray-600">{selectedSpot.address}</p>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-1" />
            <span>About {(Math.random() * 3 + 0.5).toFixed(1)} km away</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedSpot.vehicleTypes.map((type) => (
              <div key={type} className="bg-gray-100 rounded-full px-3 py-1 text-xs flex items-center">
                {getVehicleTypeIcon(type)}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between border-t border-b py-3 mt-3">
            <div>
              <p className="font-semibold">{formatCurrency(selectedSpot.price.hourly)}</p>
              <p className="text-xs text-gray-500">Per hour</p>
            </div>
            {selectedSpot.price.monthly && (
              <div>
                <p className="font-semibold">{formatCurrency(selectedSpot.price.monthly)}</p>
                <p className="text-xs text-gray-500">Per month</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Booking Form - Only show for vehicle owners */}
        {isBooking && !isSpaceOwner && (
          <Card className="animate-fade-in">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Book this spot</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between">
                  <span>Total Cost:</span>
                  <span className="font-bold">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  *Includes any applicable taxes and fees
                </p>
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  Note: If your parking time exceeds the booked duration, additional fine amount will be collected.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Action Buttons */}
        <CardFooter className="flex gap-3 pt-0">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleGetDirections}
          >
            Get Directions
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleChatWithOwner}
          >
            <MessageCircle size={16} className="mr-1" />
            Chat with Owner
          </Button>
          
          {!isSpaceOwner && (
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleBookNow}
              disabled={isBooking && (!startDate || !startTime || !endDate || !endTime || totalCost === 0)}
            >
              {isBooking ? 'Confirm Booking' : 'Book Now'}
            </Button>
          )}
        </CardFooter>
      </DialogContent>
      
      {/* Chat Dialog */}
      <AlertDialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chat with {selectedSpot.name} Owner</AlertDialogTitle>
            <AlertDialogDescription>
              Send a message to the spot owner. They will respond to your inquiries shortly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="border rounded-md p-4 bg-gray-50 h-40 overflow-y-auto">
              <p className="text-sm text-gray-500 italic">Start a conversation with the spot owner...</p>
            </div>
            
            <div className="flex gap-2">
              <Input 
                placeholder="Type your message..." 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                Send
              </Button>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default SpotDetail;
