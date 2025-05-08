
import React from 'react';
import { Star, MapPin, Car, Bike } from 'lucide-react';
import { ParkingSpot } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';

interface SpotDetailsTabProps {
  spot: ParkingSpot;
}

const SpotDetailsTab: React.FC<SpotDetailsTabProps> = ({ spot }) => {
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
    <div className="space-y-3">
      <div className="flex items-center space-x-1">
        <Star size={16} className="text-yellow-500" fill="currentColor" />
        <span className="font-medium">{spot.rating}</span>
        <span className="text-gray-500 text-sm">• Rating</span>
      </div>
      
      <p className="text-sm text-gray-600">{spot.description}</p>
      
      {spot.address && (
        <p className="text-sm text-gray-600">{spot.address}</p>
      )}
      
      <div className="flex items-center text-sm text-gray-600">
        <MapPin size={16} className="mr-1" />
        <span>About {(Math.random() * 3 + 0.5).toFixed(1)} km away</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {spot.vehicleTypes.map((type) => (
          <div key={type} className="bg-gray-100 rounded-full px-3 py-1 text-xs flex items-center">
            {getVehicleTypeIcon(type)}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between border-t border-b py-3 mt-3">
        <div>
          <p className="font-semibold">{formatCurrency(spot.price.hourly)}</p>
          <p className="text-xs text-gray-500">Per hour</p>
        </div>
        {spot.price.monthly && (
          <div>
            <p className="font-semibold">{formatCurrency(spot.price.monthly)}</p>
            <p className="text-xs text-gray-500">Per month</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotDetailsTab;
