
import React, { useRef, useEffect, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { useApp, ParkingSpot } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  spots: ParkingSpot[];
  onSpotClick?: (spot: ParkingSpot) => void;
  pickLocation?: boolean;
  onLocationPicked?: (location: google.maps.LatLngLiteral) => void;
}

const MapComponent: React.FC<MapProps> = ({ 
  center, 
  zoom = 14, 
  spots, 
  onSpotClick, 
  pickLocation = false,
  onLocationPicked
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [pickedLocation, setPickedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Initialize the map
  useEffect(() => {
    if (ref.current && !map) {
      const mapInstance = new google.maps.Map(ref.current, {
        center: center || { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      setMap(mapInstance);
    }
  }, [ref, map, center, zoom]);

  // Get user's location
  useEffect(() => {
    if (map && !userLocation && !pickLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(pos);
            map.setCenter(pos);

            // Add user location marker
            const userMarker = new google.maps.Marker({
              position: pos,
              map,
              title: "You are here",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
                scale: 8,
              },
              zIndex: 1000,
            });

            // Add info window for user location
            const infoWindow = new google.maps.InfoWindow({
              content: "<div style='font-weight: bold;'>You are here</div>",
            });

            userMarker.addListener("click", () => {
              infoWindow.open(map, userMarker);
            });
          },
          (error) => {
            console.error("Error getting user location:", error);
            toast.error("Could not get your location. Using default location.");
          }
        );
      } else {
        toast.error("Your browser doesn't support geolocation");
      }
    }
  }, [map, userLocation, pickLocation]);

  // Location picker functionality
  useEffect(() => {
    if (map && pickLocation && onLocationPicked) {
      // Create a draggable marker if it doesn't exist
      if (!markerRef.current) {
        const marker = new google.maps.Marker({
          position: center || { lat: 12.9716, lng: 77.5946 },
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          title: "Drag to set location",
        });
        markerRef.current = marker;
        
        // Set initial picked location
        setPickedLocation(marker.getPosition()?.toJSON() || null);
        if (onLocationPicked) {
          onLocationPicked(marker.getPosition()?.toJSON() as google.maps.LatLngLiteral);
        }

        // Add drag end listener
        marker.addListener('dragend', () => {
          const newPos = marker.getPosition()?.toJSON();
          if (newPos) {
            setPickedLocation(newPos);
            if (onLocationPicked) {
              onLocationPicked(newPos);
            }
          }
        });

        // Allow clicking on map to move marker
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (markerRef.current && e.latLng) {
            markerRef.current.setPosition(e.latLng);
            const newPos = e.latLng.toJSON();
            setPickedLocation(newPos);
            if (onLocationPicked) {
              onLocationPicked(newPos);
            }
          }
        });
      }
    }

    return () => {
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current);
      }
    };
  }, [map, pickLocation, center, onLocationPicked]);

  // Add parking spot markers
  useEffect(() => {
    if (map && spots.length > 0 && !pickLocation) {
      // Clear existing markers
      markers.forEach((marker) => marker.setMap(null));
      const newMarkers: google.maps.Marker[] = [];

      spots.forEach((spot) => {
        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'marker-container';
        
        // Add correct color based on status
        let color;
        switch (spot.status) {
          case 'available':
            color = '#4CAF50'; // Green
            break;
          case 'soon':
            color = '#FFD700'; // Yellow
            break;
          case 'filling':
            color = '#FF5252'; // Red
            break;
          default:
            color = '#757575'; // Gray
        }
        
        markerElement.innerHTML = `<div style="width: 100%; height: 100%; background-color: ${color}; border-radius: 50%;"></div>`;

        // Create custom marker
        const marker = new google.maps.Marker({
          position: spot.location,
          map,
          title: spot.name,
        });

        // Add click listener
        marker.addListener('click', () => {
          if (onSpotClick) {
            onSpotClick(spot);
          }
        });

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);
    }

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [map, spots, pickLocation, onSpotClick]);

  return <div ref={ref} className="map-container" />;
};

// Wrapper component for Google Maps
const GoogleMap: React.FC<Omit<MapProps, 'spots'> & { apiKey: string }> = ({ 
  apiKey,
  ...props
}) => {
  const { filteredSpots } = useApp();

  return (
    <Wrapper apiKey={apiKey} libraries={['places']}>
      <MapComponent spots={filteredSpots} {...props} />
    </Wrapper>
  );
};

export default GoogleMap;
