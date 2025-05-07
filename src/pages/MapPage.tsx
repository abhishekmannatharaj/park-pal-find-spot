
import React, { useState, useEffect } from 'react';
import SearchAndFilter from '@/components/map/SearchAndFilter';
import GoogleMap from '@/components/map/GoogleMap';
import SpotList from '@/components/map/SpotList';
import SpotDetail from '@/components/map/SpotDetail';
import { Button } from "@/components/ui/button";
import { List } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import AppLayout from '@/components/layout/AppLayout';

const MapPage: React.FC = () => {
  const { showListView, toggleListView } = useApp();
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);

  // Get user's current location when the page loads
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Default to Bangalore
          setUserLocation({ lat: 12.9716, lng: 77.5946 });
        }
      );
    } else {
      // Default to Bangalore if geolocation is not supported
      setUserLocation({ lat: 12.9716, lng: 77.5946 });
    }
  }, []);

  return (
    <AppLayout>
      <div className="relative h-screen">
        {/* Search and filter controls */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-white/80 backdrop-blur-sm">
          <SearchAndFilter />
          
          <Button
            variant="outline"
            size="sm"
            className="bg-white shadow-md mt-2"
            onClick={toggleListView}
          >
            <List size={18} className="mr-1" />
            {showListView ? 'Hide List' : 'Show List'}
          </Button>
        </div>
        
        {/* Google Map Component */}
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <GoogleMap 
            apiKey="AIzaSyAy71IIAH6wSCX4heLACwywNPzueSpCvk0" 
            center={userLocation || undefined}
          />
        </div>
        
        {/* List view */}
        {showListView && (
          <SpotList className="z-10" />
        )}
        
        {/* Spot Detail Modal */}
        <SpotDetail />
      </div>
    </AppLayout>
  );
};

export default MapPage;
