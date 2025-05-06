
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
  Star, 
  Calendar, 
  Clock,
  Car, 
  Bike,
  MapPin
} from "lucide-react";
import { useApp } from '@/context/AppContext';
import { cn, formatCurrency } from '@/lib/utils';

const SpotDetail: React.FC = () => {
  const { selectedSpot, setSelectedSpot, bookSpot } = useApp();
  const [isBooking, setIsBooking] = useState(false);
  
  // Booking form state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCost, setTotalCost] = useState(0);

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

  return (
    <Dialog 
      open={!!selectedSpot} 
      onOpenChange={(open) => !open && setSelectedSpot(null)}
    >
      <DialogContent className="max-w-md mx-auto">
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
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-1" />
            <span>About {(Math.random() * 3 + 0.5).toFixed(1)} km away</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedSpot.vehicleTypes.includes('car') && (
              <div className="bg-gray-100 rounded-full px-3 py-1 text-xs flex items-center">
                <Car size={14} className="mr-1" />
                Car
              </div>
            )}
            {selectedSpot.vehicleTypes.includes('bike') && (
              <div className="bg-gray-100 rounded-full px-3 py-1 text-xs flex items-center">
                <Bike size={14} className="mr-1" />
                Bike
              </div>
            )}
            {selectedSpot.vehicleTypes.includes('sedan') && (
              <div className="bg-gray-100 rounded-full px-3 py-1 text-xs flex items-center">
                <Car size={14} className="mr-1" />
                Sedan
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between border-t border-b py-3 mt-3">
            <div>
              <p className="font-semibold">{formatCurrency(selectedSpot.price.hourly)}</p>
              <p className="text-xs text-gray-500">Per hour</p>
            </div>
            <div>
              <p className="font-semibold">{formatCurrency(selectedSpot.price.monthly)}</p>
              <p className="text-xs text-gray-500">Per month</p>
            </div>
          </div>
        </div>
        
        {/* Booking Form */}
        {isBooking && (
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
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleBookNow}
            disabled={isBooking && (!startDate || !startTime || !endDate || !endTime || totalCost === 0)}
          >
            {isBooking ? 'Confirm Booking' : 'Book Now'}
          </Button>
        </CardFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpotDetail;
