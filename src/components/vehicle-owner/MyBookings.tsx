
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp, Booking, BookingStatus } from '@/context/AppContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FeedbackForm from './FeedbackForm';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleGetDirections = () => {
    if (!booking.spot) return;
    
    const { lat, lng } = booking.spot.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Check if a review has already been given for this booking
  const hasGivenReview = booking.hasReview;
  const isPastBooking = new Date(booking.endTime) < new Date();

  return (
    <>
      <Card className="mb-3">
        <CardContent className="p-3">
          <div className="flex">
            <div className="w-20 h-20 bg-gray-200 rounded mr-3 overflow-hidden">
              <img 
                src={booking.spot?.images[0]} 
                alt={booking.spot?.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium truncate">{booking.spot?.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              
              <div className="text-xs text-gray-600 mt-1">
                <div>From: {formatDate(booking.startTime)}</div>
                <div>To: {formatDate(booking.endTime)}</div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="font-medium">{formatCurrency(booking.totalCost)}</div>
                {booking.status === 'approved' && !isPastBooking && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={handleGetDirections}
                  >
                    Get Directions
                  </Button>
                )}
                {isPastBooking && !hasGivenReview && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs bg-primary text-white hover:bg-primary/90"
                    onClick={() => setShowFeedback(true)}
                  >
                    Give Review
                  </Button>
                )}
                {isPastBooking && hasGivenReview && (
                  <span className="text-xs text-green-600 font-medium">
                    Review Submitted
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-md mx-auto w-[95vw] md:w-auto">
          <DialogHeader>
            <DialogTitle>Submit Your Feedback</DialogTitle>
            <DialogDescription>
              Your feedback helps improve the parking experience for everyone.
            </DialogDescription>
          </DialogHeader>
          <FeedbackForm 
            bookingId={booking.id} 
            spotId={booking.spot?.id || ''} 
            onSuccess={() => setShowFeedback(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

const MyBookings: React.FC = () => {
  const { myBookings } = useApp();
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  
  const now = new Date();
  
  const filterBookings = (status: BookingStatus | 'all'): Booking[] => {
    return myBookings.filter(booking => {
      // For upcoming, show approved bookings with future start time
      if (activeTab === 'upcoming') {
        return booking.status === 'approved' && new Date(booking.startTime) > now;
      }
      
      // For pending, show all pending bookings
      if (activeTab === 'pending') {
        return booking.status === 'pending';
      }
      
      // For past, show completed bookings or bookings with past end time
      if (activeTab === 'past') {
        return booking.status === 'completed' || 
               (booking.status === 'approved' && new Date(booking.endTime) < now);
      }
      
      return status === 'all' ? true : booking.status === status;
    });
  };
  
  const upcomingBookings = filterBookings('approved');
  const pendingBookings = filterBookings('pending');
  const pastBookings = filterBookings('completed');
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No upcoming bookings
              </div>
            ) : (
              upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="pending">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending bookings
              </div>
            ) : (
              pendingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="past">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {pastBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No past bookings
              </div>
            ) : (
              pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyBookings;
