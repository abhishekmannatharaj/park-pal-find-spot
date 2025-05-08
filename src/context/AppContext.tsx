import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

// Types
export type VehicleType = 'car' | 'bike' | 'sedan' | 'hatchback' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'compact';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface ParkingSpot {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  address?: string; // Added address field
  price: {
    hourly: number;
    monthly?: number; // Made monthly optional
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
  hasReview?: boolean; // Added hasReview field
}

export interface Review {
  id: string;
  spotId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  attributes: {
    isRealImage: boolean;
    isSpaceAccurate: boolean;
    isOwnerResponsive: boolean;
    isSafeParking: boolean;
    hasGoodLighting: boolean;
    isClean: boolean;
    isPaved: boolean;
  };
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
  mySpots: ParkingSpot[];
  deleteSpot: (spotId: string) => void;
  getSpotReviews: (spotId: string) => Review[]; // Added getSpotReviews
  submitReview: (review: Omit<Review, 'id' | 'date'>) => void; // Added submitReview
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
      address: '1, MG Road, Bengaluru, Karnataka 560001',
      price: {
        hourly: 40,
        monthly: 3000
      },
      rating: 4.5,
      vehicleTypes: ['car', 'bike'],
      images: [
        'https://images.unsplash.com/photo-1604063165585-e17e9c3c3f0b?q=80&w=400',
        'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=400',
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=400'
      ],
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
      address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
      price: {
        hourly: 50
      },
      rating: 4.2,
      vehicleTypes: ['car', 'sedan', 'suv'],
      images: [
        'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?q=80&w=400',
        'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=400',
        'https://images.unsplash.com/photo-1611192052550-32918395b8c6?q=80&w=400'
      ],
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
      address: 'Koramangala 4th Block, Bengaluru, Karnataka 560034',
      price: {
        hourly: 60,
        monthly: 4000
      },
      rating: 4.8,
      vehicleTypes: ['car', 'sedan', 'bike', 'hatchback'],
      images: [
        'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=400',
        'https://images.unsplash.com/photo-1611192052550-32918395b8c6?q=80&w=400',
        'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=400'
      ],
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
      address: 'Whitefield, ITPB, Bengaluru, Karnataka 560066',
      price: {
        hourly: 30
      },
      rating: 3.9,
      vehicleTypes: ['car', 'bike', 'suv'],
      images: [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=400',
        'https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=400',
        'https://images.unsplash.com/photo-1611192052550-32918395b8c6?q=80&w=400'
      ],
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
      address: 'HSR Layout Sector 2, Bengaluru, Karnataka 560102',
      price: {
        hourly: 45,
        monthly: 3200
      },
      rating: 4.3,
      vehicleTypes: ['car', 'sedan', 'hatchback'],
      images: [
        'https://images.unsplash.com/photo-1611866272825-b9eb96304297?q=80&w=400',
        'https://images.unsplash.com/photo-1611192052550-32918395b8c6?q=80&w=400',
        'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=400'
      ],
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
  const [reviews, setReviews] = useState<Review[]>([]); // Added reviews state
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

  // Get my spots (owned by current user)
  const mySpots = parkingSpots.filter(spot => spot.ownerId === '1');

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

  // Delete a spot
  const deleteSpot = (spotId: string) => {
    setParkingSpots(prev => prev.filter(spot => spot.id !== spotId));
    toast.success("Parking spot deleted successfully!");
  };

  // Upload verification document
  const uploadVerificationDoc = (file: File) => {
    // Simulate uploading
    toast.info("Document uploaded! Verification in progress.");
  };

  // Get reviews for a specific spot
  const getSpotReviews = (spotId: string): Review[] => {
    // Return reviews for the specific spot or empty array if none
    const spotReviews = reviews.filter(review => review.spotId === spotId);
    
    // If no reviews exist, create some dummy reviews for demo purposes
    if (spotReviews.length === 0) {
      const dummyReviews = [
        {
          id: `review-${spotId}-1`,
          spotId: spotId,
          userId: 'user1',
          userName: 'John Doe',
          rating: 4.5,
          comment: 'Great parking spot, very convenient location and well maintained.',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          attributes: {
            isRealImage: true,
            isSpaceAccurate: true,
            isOwnerResponsive: true,
            isSafeParking: true,
            hasGoodLighting: true,
            isClean: true,
            isPaved: true
          }
        },
        {
          id: `review-${spotId}-2`,
          spotId: spotId,
          userId: 'user2',
          userName: 'Jane Smith',
          rating: 3.5,
          comment: 'Decent spot, but lighting could be better at night.',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          attributes: {
            isRealImage: true,
            isSpaceAccurate: true,
            isOwnerResponsive: false,
            isSafeParking: true,
            hasGoodLighting: false,
            isClean: true,
            isPaved: false
          }
        }
      ];
      
      return dummyReviews;
    }
    
    return spotReviews;
  };
  
  // Submit a new review
  const submitReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `review-${Date.now()}`,
      date: new Date()
    };
    
    setReviews(prev => [...prev, newReview]);
    
    // Mark the booking as having a review
    setMyBookings(prev => 
      prev.map(booking => 
        booking.spotId === reviewData.spotId && booking.userId === reviewData.userId
          ? { ...booking, hasReview: true }
          : booking
      )
    );
    
    toast.success("Review submitted successfully!");
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
      toggleListView,
      mySpots,
      deleteSpot,
      getSpotReviews,
      submitReview
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
