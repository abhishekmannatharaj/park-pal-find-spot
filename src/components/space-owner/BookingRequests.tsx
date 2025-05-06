
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp, Booking } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';

const RequestCard: React.FC<{
  booking: Booking;
  onAction: (booking: Booking, action: 'approve' | 'reject') => void;
}> = ({ booking, onAction }) => {
  const [showConfirm, setShowConfirm] = useState<'approve' | 'reject' | null>(null);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleAction = (action: 'approve' | 'reject') => {
    setShowConfirm(action);
  };
  
  const confirmAction = () => {
    if (showConfirm) {
      onAction(booking, showConfirm);
    }
    setShowConfirm(null);
  };
  
  let statusColor;
  switch (booking.status) {
    case 'approved':
      statusColor = 'text-green-600';
      break;
    case 'rejected':
      statusColor = 'text-red-600';
      break;
    case 'pending':
      statusColor = 'text-yellow-600';
      break;
    default:
      statusColor = 'text-gray-600';
  }

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{booking.spot?.name}</h4>
              <p className="text-sm text-gray-600 mt-1">User: {booking.userId}</p>
              <div className="text-sm mt-2">
                <div><span className="font-medium">From:</span> {formatDate(booking.startTime)}</div>
                <div><span className="font-medium">To:</span> {formatDate(booking.endTime)}</div>
              </div>
              <div className="mt-2">
                <span className="font-medium">Amount: </span>
                <span className="font-bold">{formatCurrency(booking.totalCost)}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`font-medium ${statusColor} mb-2`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
              
              {booking.status === 'pending' && (
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleAction('approve')}
                  >
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleAction('reject')}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {showConfirm === 'approve' ? 'Approve Booking' : 'Reject Booking'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {showConfirm === 'approve'
                ? "Are you sure you want to approve this booking request?"
                : "Are you sure you want to reject this booking request?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              className={showConfirm === 'approve' ? "bg-primary" : "bg-red-500 hover:bg-red-600"}
            >
              {showConfirm === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const BookingRequests: React.FC = () => {
  const { bookingRequests, handleBookingAction, earnings } = useApp();
  
  const handleAction = (booking: Booking, action: 'approve' | 'reject') => {
    handleBookingAction(booking.id, action);
  };
  
  const pendingRequests = bookingRequests.filter(b => b.status === 'pending');
  const processedRequests = bookingRequests.filter(b => b.status !== 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(earnings)}</div>
          <p className="text-sm text-gray-500 mt-1">Total Earnings</p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xl font-medium">{processedRequests.filter(b => b.status === 'approved').length}</div>
              <p className="text-sm text-gray-500">Approved Bookings</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xl font-medium">{pendingRequests.length}</div>
              <p className="text-sm text-gray-500">Pending Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-xl font-bold mb-3">Booking Requests</h2>
        
        {pendingRequests.length === 0 && processedRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No booking requests yet
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-350px)]">
            {pendingRequests.length > 0 && (
              <>
                <h3 className="font-medium mb-2">Pending Requests</h3>
                {pendingRequests.map(booking => (
                  <RequestCard 
                    key={booking.id} 
                    booking={booking} 
                    onAction={handleAction}
                  />
                ))}
              </>
            )}
            
            {processedRequests.length > 0 && (
              <>
                <h3 className="font-medium mb-2 mt-4">Processed Requests</h3>
                {processedRequests.map(booking => (
                  <RequestCard 
                    key={booking.id} 
                    booking={booking} 
                    onAction={handleAction}
                  />
                ))}
              </>
            )}
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default BookingRequests;
