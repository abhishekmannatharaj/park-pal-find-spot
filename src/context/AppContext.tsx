
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

// Types
export type VehicleType = 'car' | 'bike' | 'sedan';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface ParkingSpot {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  price: {
    hourly: number;
    monthly: number;
  };
  rating: number;
  vehicleTypes: VehicleType[];
  images: string[];
  availability: {
    startDate: Date;
    endDate: Date;
  };
  status: 'available' | 'soon' | 'filling' | 'full';
  ownerId: string;
}

export interface Booking {
  id: string;
  spotId: string;
  spot: ParkingSpot;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  totalCost: number;
  createdAt: Date;
}

interface AppContextType {
  parkingSpots: ParkingSpot[];
  myBookings: Booking[];
  bookingRequests: Booking[];
  selectedSpot: ParkingSpot | null;
  setSelectedSpot: (spot: ParkingSpot | null) => void;
  filteredSpots: ParkingSpot[];
  filters: {
    search: string;
    vehicleType: VehicleType | null;
    maxPrice: number;
    minRating: number;
  };
  earnings: number;
  updateFilters: (key: string, value: any) => void;
  bookSpot: (spotId: string, startTime: Date, endTime: Date) => void;
  handleBookingAction: (bookingId: string, action: 'approve' | 'reject') => void;
  addNewSpot: (spot: Omit<ParkingSpot, 'id' | 'ownerId'>) => void;
  uploadVerificationDoc: (file: File) => void;
  showListView: boolean;
  toggleListView: () => void;
}

// Dummy data for parking spots in Bangalore
const generateDummyParkingSpots = (): ParkingSpot[] => {
  return [
    {
      id: '1',
      name: 'MG Road Parking',
      description: 'Convenient parking near MG Road metro station with 24/7 security',
      location: {
        lat: 12.9757,
        lng: 77.6097
      },
      price: {
        hourly: 40,
        monthly: 3000
      },
      rating: 4.5,
      vehicleTypes: ['car', 'bike'],
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      availability: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      status: 'available',
      ownerId: '2'
    },
    {
      id: '2',
      name: 'Indiranagar Basement',
      description: 'Secure underground parking in Indiranagar 100ft Road',
      location: {
        lat: 12.9784,
        lng: 77.6408
      },
      price: {
        hourly: 50,
        monthly: 3500
      },
      rating: 4.2,
      vehicleTypes: ['car', 'sedan'],
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      availability: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      status: 'soon',
      ownerId: '2'
    },
    {
      id: '3',
      name: 'Koramangala Plaza',
      description: 'Premium parking space in Koramangala with CCTV surveillance',
      location: {
        lat: 12.9340,
        lng: 77.6156
      },
      price: {
        hourly: 60,
        monthly: 4000
      },
      rating: 4.8,
      vehicleTypes: ['car', 'sedan', 'bike'],
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      availability: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      status: 'filling',
      ownerId: '3'
    },
    {
      id: '4',
      name: 'Whitefield Tech Park',
      description: 'Spacious parking area near ITPB with shade',
      location: {
        lat: 12.9699,
        lng: 77.7502
      },
      price: {
        hourly: 30,
        monthly: 2500
      },
      rating: 3.9,
      vehicleTypes: ['car', 'bike'],
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      availability: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      status: 'available',
      ownerId: '3'
    },
    {
      id: '5',
      name: 'HSR Layout Basement',
      description: 'Underground parking with 24/7 security in HSR Layout',
      location: {
        lat: 12.9081,
        lng: 77.6476
      },
      price: {
        hourly: 45,
        monthly: 3200
      },
      rating: 4.3,
      vehicleTypes: ['car', 'sedan'],
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      availability: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      status: 'available',
      ownerId: '4'
    }
  ];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>(generateDummyParkingSpots());
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [bookingRequests, setBookingRequests] = useState<Booking[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showListView, setShowListView] = useState<boolean>(false);
  const [earnings, setEarnings] = useState<number>(1250); // Dummy earnings
  const [filters, setFilters] = useState({
    search: '',
    vehicleType: null as VehicleType | null,
    maxPrice: 100,
    minRating: 0,
  });

  // Filter spots based on search and filters
  const filteredSpots = parkingSpots.filter(spot => {
    // Search filter
    if (filters.search && !spot.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Vehicle type filter
    if (filters.vehicleType && !spot.vehicleTypes.includes(filters.vehicleType)) {
      return false;
    }

    // Price filter (hourly rate)
    if (spot.price.hourly > filters.maxPrice) {
      return false;
    }

    // Rating filter
    if (spot.rating < filters.minRating) {
      return false;
    }

    return true;
  });

  // Update filters
  const updateFilters = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Toggle list view
  const toggleListView = () => {
    setShowListView(prev => !prev);
  };

  // Book a spot
  const bookSpot = (spotId: string, startTime: Date, endTime: Date) => {
    const spot = parkingSpots.find(s => s.id === spotId);
    
    if (!spot) {
      toast.error("Parking spot not found!");
      return;
    }
    
    // Calculate duration in hours
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Calculate cost
    const totalCost = spot.price.hourly * durationHours;
    
    // Create a new booking
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      spotId: spot.id,
      spot,
      userId: '1',
      startTime,
      endTime,
      status: 'pending',
      totalCost,
      createdAt: new Date()
    };
    
    // Add to bookings
    setMyBookings(prev => [...prev, newBooking]);
    
    // Add to booking requests for the owner
    setBookingRequests(prev => [...prev, newBooking]);
    
    toast.success("Booking request sent! Awaiting approval.");
    setSelectedSpot(null);
  };

  // Handle booking approval/rejection
  const handleBookingAction = (bookingId: string, action: 'approve' | 'reject') => {
    // Update booking requests
    setBookingRequests(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: action === 'approve' ? 'approved' : 'rejected' } 
          : booking
      )
    );
    
    // Update my bookings in case the user views their bookings
    setMyBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: action === 'approve' ? 'approved' : 'rejected' } 
          : booking
      )
    );
    
    if (action === 'approve') {
      toast.success("Booking approved!");
      // Add earnings if approved
      const booking = bookingRequests.find(b => b.id === bookingId);
      if (booking) {
        setEarnings(prev => prev + booking.totalCost);
      }
    } else {
      toast.info("Booking rejected.");
    }
  };

  // Add new parking spot
  const addNewSpot = (spotData: Omit<ParkingSpot, 'id' | 'ownerId'>) => {
    const newSpot: ParkingSpot = {
      ...spotData,
      id: `spot-${Date.now()}`,
      ownerId: '1', // Assuming current user is owner
    };
    
    setParkingSpots(prev => [...prev, newSpot]);
    toast.success("New parking spot added successfully!");
  };

  // Upload verification document
  const uploadVerificationDoc = (file: File) => {
    // Simulate uploading
    toast.info("Document uploaded! Verification in progress.");
  };

  return (
    <AppContext.Provider value={{
      parkingSpots,
      myBookings,
      bookingRequests,
      selectedSpot,
      setSelectedSpot,
      filteredSpots,
      filters,
      earnings,
      updateFilters,
      bookSpot,
      handleBookingAction,
      addNewSpot,
      uploadVerificationDoc,
      showListView,
      toggleListView
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
