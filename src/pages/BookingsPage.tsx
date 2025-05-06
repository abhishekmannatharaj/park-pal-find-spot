
import React from 'react';
import BookingRequests from '@/components/space-owner/BookingRequests';
import MyBookings from '@/components/vehicle-owner/MyBookings';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';

const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const isSpaceOwner = user?.role === 'space_owner';
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          {isSpaceOwner ? 'Booking Requests' : 'My Bookings'}
        </h1>
        
        {isSpaceOwner ? <BookingRequests /> : <MyBookings />}
      </div>
    </AppLayout>
  );
};

export default BookingsPage;
